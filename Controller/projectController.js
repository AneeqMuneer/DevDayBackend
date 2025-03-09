const ErrorHandler = require("../Utils/errorHandler.js");
const catchAsyncError = require("../Middleware/asyncError.js");
const { Op, Sequelize } = require("sequelize");
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const dotenv = require('dotenv');

dotenv.config({ path: "../config/config.env" });

const ProjectModel = require("../Model/projectModel.js");
const { SendProjectRegisterMail } = require("../Utils/projectUtils.js");


exports.RegisterProject = catchAsyncError(async (req, res, next) => {
    const { Project_Name, Description, Supervisor, Institution_Name, L_Email, L_Contact, L_CNIC, BA_Code } = req.body;
    let { Team_Name, L_Name, Members } = req.body;

    if (!Team_Name || !Project_Name || !Description || !Members || !L_Name || !L_Contact || !L_Email || !L_CNIC || !Institution_Name || !Supervisor) {
        return next(new ErrorHandler("Please fill the required fields.", 400));
    }

    if (Members && typeof Members === 'string') {
        try {
            Members = JSON.parse(Members);
        } catch (error) {
            return next(new ErrorHandler("Invalid Members format. Please provide a valid JSON array.", 400));
        }
    }

    Team_Name = Team_Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    L_Name = L_Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    for (let member of Members) {
        member.Name = member.Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
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

    if (!Array.isArray(Members) || TeamMembers.length < 1 || TeamMembers.length > 3) {
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
    if (req.files) {
        if (req.files.length > 1) {
            return next(new ErrorHandler("Only one project report is allowed.", 400));
        }

        try {
            const projectReport = req.files.find(file => file.fieldname === 'Project_Report');

            if (projectReport) {
                const storageAccountName = process.env.AZURE_ACCOUNT_NAME;
                const storageAccountKey = process.env.AZURE_ACCOUNT_KEY;
                const containerName = process.env.AZURE_CONTAINER_NAME;

                const storageAccountBaseUrl = `https://${storageAccountName}.blob.core.windows.net`;
                const sharedKeyCredential = new StorageSharedKeyCredential(storageAccountName, storageAccountKey);
                const blobServiceClient = new BlobServiceClient(
                    storageAccountBaseUrl,
                    sharedKeyCredential
                );

                const containerClient = blobServiceClient.getContainerClient(containerName);

                const FirstPart = L_CNIC.replace(/[\s-]+/g, '');
                const SecondPart = projectReport.originalname.replace(/[\s-]+/g, '').toLowerCase().split('.')[0];
                console.log(FirstPart, SecondPart);
                const blobName = `${FirstPart}-${SecondPart}`;
                console.log(blobName);

                const blockBlobClient = containerClient.getBlockBlobClient(blobName);

                await blockBlobClient.uploadData(projectReport.buffer, {
                    blobHTTPHeaders: {
                        blobContentType: projectReport.mimetype
                    }
                });

                reportUrl = blockBlobClient.url;
            }
        } catch (err) {
            console.error("Azure Blob Storage upload error:", err);
            return next(new ErrorHandler("Error uploading project report to Azure Blob Storage", 500));
        }
    }

    if (reportUrl === null) {
        return next(new ErrorHandler("Project report is required.", 400));
    }

    const Project = await ProjectModel.create({
        Team_Name,
        Project_Name,
        Description,
        Supervisor,
        Institution_Name,
        L_Name,
        L_Contact,
        L_Email,
        L_CNIC,
        Members,
        BA_Code,
        Project_Report: reportUrl
    });

    SendProjectRegisterMail(Team_Name, L_Email);

    res.status(200).json({
        success: true,
        message: "Project registered successfully.",
        Project
    });
});