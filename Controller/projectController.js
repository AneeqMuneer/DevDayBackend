const ErrorHandler = require("../Utils/errorHandler.js");
const catchAsyncError = require("../Middleware/asyncError.js");
const { Op, Sequelize } = require("sequelize");
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const cloudinary = require("../config/cloudinary.js");
const dotenv = require('dotenv');

dotenv.config({ path: "../config/config.env" });

const ProjectModel = require("../Model/projectModel.js");
const { SendProjectRegisterMail } = require("../Utils/projectUtils.js");


exports.RegisterProject = catchAsyncError(async (req, res, next) => {
    console.log("RegisterProject function called");
    console.log("Request body:", JSON.stringify(req.body));
    console.log("Request files:", req.files ? `Files exist: ${req.files.length}` : "No files");

    const { Project_Name, Institution_Name, L_Email, L_Contact, L_CNIC, BA_Code } = req.body;
    let { Team_Name, L_Name, Members } = req.body;

    console.log("Extracted fields:", {
        Team_Name,
        Project_Name,
        Institution_Name,
        L_Name,
        L_Contact,
        L_Email,
        L_CNIC,
        "Members type": typeof Members,
        "BA_Code": BA_Code
    });

    if (!Team_Name || !Project_Name || !Members || !L_Name || !L_Contact || !L_Email || !L_CNIC || !Institution_Name) {
        console.log("Missing required fields");
        console.log("Team_Name:", Team_Name);
        console.log("Project_Name:", Project_Name);
        console.log("Members:", Members);
        console.log("L_Name:", L_Name);
        console.log("L_Contact:", L_Contact);
        console.log("L_Email:", L_Email);
        console.log("L_CNIC:", L_CNIC);
        console.log("Institution_Name:", Institution_Name);
        return next(new ErrorHandler("Please fill the required fields.", 400));
    }

    if (Members && typeof Members === 'string') {
        try {
            console.log("Parsing Members JSON string");
            Members = JSON.parse(Members);
            console.log("Parsed Members:", Members);
        } catch (error) {
            console.log("Error parsing Members:", error);
            return next(new ErrorHandler("Invalid Members format. Please provide a valid JSON array.", 400));
        }
    }

    const TeamMembers = [
        {
            Name: L_Name,
            Email: L_Email,
            Contact: L_Contact,
            CNIC: L_CNIC
        },
        ...Members
    ];

    if (!Array.isArray(Members) || TeamMembers.length < 1 || TeamMembers.length > 4) {
        return next(new ErrorHandler("Invalid number of participants.", 400));
    }

    const emails = new Set();
    const contacts = new Set();
    const cnics = new Set();

    for (const member of TeamMembers) {
        if (!member.Name || !member.Email || !member.Contact || !member.CNIC) {
            return next(new ErrorHandler("All members must have Name, Email, Contact, and CNIC.", 400));
        }

        if (!/^\d{5}-\d{7}-\d{1}$/g.test(member.CNIC)) {
            return next(new ErrorHandler(`Invalid CNIC format for ${member.Name}.`, 400));
        }

        if (emails.has(member.Email) || contacts.has(member.Contact) || cnics.has(member.CNIC)) {
            return next(new ErrorHandler("Duplicate participant details detected.", 400));
        }

        emails.add(member.Email);
        contacts.add(member.Contact);
        cnics.add(member.CNIC);

        const emailArray = Array.from(emails);

        const existingTeam = await ProjectModel.findOne({
            where: {
                [Op.or]: emailArray.map((email, index) => ({
                    [Op.or]: [
                        { L_Email: email },
                        Sequelize.literal(`
                            EXISTS (
                                SELECT 1 FROM jsonb_array_elements("Members"::jsonb) AS member 
                                WHERE member->>'Email' = $${index + 1}
                            )
                        `)
                    ]
                })),
            },
            bind: emailArray
        });

        if (existingTeam) {
            return next(new ErrorHandler("One or more members are already registered with a Project.", 400));
        }
    }

    let reportUrl = null;
    let paymentPhotoUrl = null;
    
    if (req.files && req.files.length > 0) {
        console.log("Processing file uploads");
        console.log("Files available:", req.files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname })));

        // Process Project Report
        const projectReport = req.files.find(file => file.fieldname === 'Project_Report');
        if (projectReport) {
            console.log("Project report found:", {
                originalname: projectReport.originalname,
                mimetype: projectReport.mimetype,
                size: projectReport.size,
                hasBuffer: !!projectReport.buffer
            });

            try {
                const storageAccountName = process.env.AZURE_ACCOUNT_NAME;
                const storageAccountKey = process.env.AZURE_ACCOUNT_KEY;
                const containerName = process.env.AZURE_CONTAINER_NAME;

                console.log("Azure storage configuration:", {
                    accountName: storageAccountName ? "Set" : "Not set",
                    accountKey: storageAccountKey ? "Set" : "Not set",
                    containerName: containerName ? "Set" : "Not set"
                });

                const storageAccountBaseUrl = `https://${storageAccountName}.blob.core.windows.net`;
                const sharedKeyCredential = new StorageSharedKeyCredential(storageAccountName, storageAccountKey);
                const blobServiceClient = new BlobServiceClient(
                    storageAccountBaseUrl,
                    sharedKeyCredential
                );

                console.log("Created blob service client");
                const containerClient = blobServiceClient.getContainerClient(containerName);
                console.log("Created container client");

                const FirstPart = L_CNIC.replace(/[\s-]+/g, '');
                const SecondPart = projectReport.originalname.replace(/[\s-]+/g, '').toLowerCase();
                console.log("Blob name parts:", FirstPart, SecondPart);

                // Sanitize the blob name to ensure it only contains valid characters
                // Azure Blob Storage allows letters, numbers, and limited special characters
                let blobName = `${FirstPart}-${SecondPart}`;
                // Replace any invalid characters with underscores
                blobName = blobName.replace(/[^a-z0-9\-_.]/gi, '_');
                // Ensure the name is between 1-1024 characters
                blobName = blobName.substring(0, 1024);
                console.log("Sanitized blob name:", blobName);

                const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                console.log("Created block blob client");

                console.log("Uploading to Azure Blob Storage...");
                await blockBlobClient.uploadData(projectReport.buffer, {
                    blobHTTPHeaders: {
                        blobContentType: projectReport.mimetype
                    }
                });
                console.log("Upload complete");

                reportUrl = blockBlobClient.url;
                console.log("Report URL:", reportUrl);
            } catch (err) {
                console.error("Azure Blob Storage upload error:", err);
                return next(new ErrorHandler("Error uploading project report to Azure Blob Storage", 500));
            }
        } else {
            console.log("Project report not found in files");
        }

        // Process Payment Photo using Cloudinary
        const paymentPhoto = req.files.find(file => file.fieldname === 'Payment_Photo');
        if (paymentPhoto) {
            console.log("Payment photo found:", {
                originalname: paymentPhoto.originalname,
                mimetype: paymentPhoto.mimetype,
                size: paymentPhoto.size,
                hasBuffer: !!paymentPhoto.buffer
            });

            try {
                const uploadResult = await new Promise((resolve, reject) => {
                    if (!paymentPhoto.buffer) {
                        console.log("No buffer in payment photo file");
                        return reject(new ErrorHandler('Invalid file data', 400));
                    }

                    console.log("Creating upload stream for payment photo");
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image', folder: 'projects' },
                        (error, result) => {
                            if (error) {
                                console.log("Cloudinary upload error for payment photo:", error);
                                reject(new ErrorHandler('Error uploading payment image to Cloudinary', 500));
                            } else {
                                console.log("Cloudinary upload success for payment photo");
                                resolve(result.secure_url);
                            }
                        }
                    );

                    console.log("Writing payment photo to stream");
                    stream.write(paymentPhoto.buffer);
                    console.log("Ending payment photo stream");
                    stream.end();
                });

                console.log("Payment photo upload complete, URL:", uploadResult);
                paymentPhotoUrl = uploadResult;

            } catch (err) {
                console.log("Error in payment photo upload:", err);
                return next(err);
            }
        } else {
            console.log("Payment photo not found in files");
        }
    } else {
        console.log("No files found in request");
    }

    if (reportUrl === null) {
        console.log("Report URL is null");
        return next(new ErrorHandler("Project report is required.", 400));
    }

    if (paymentPhotoUrl === null) {
        console.log("Payment photo URL is null");
        return next(new ErrorHandler("Payment photo is required.", 400));
    }

    Team_Name = Team_Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    L_Name = L_Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    for (let member of Members) {
        member.Name = member.Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    }

    const Project = await ProjectModel.create({
        Team_Name,
        Project_Name,
        Institution_Name,
        L_Name,
        L_Contact,
        L_Email,
        L_CNIC,
        Members,
        BA_Code,
        Project_Report: reportUrl,
        Payment_Photo: paymentPhotoUrl
    });

    SendProjectRegisterMail(Team_Name, L_Email);

    res.status(200).json({
        success: true,
        message: "Project registered successfully.",
        Project
    });
});