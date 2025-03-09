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

    console.log(req.file);

    if (req.file) {
        const storageAccountBaseUrl = `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net`;
        const sharedKeyCredential = new StorageSharedKeyCredential(process.env.AZURE_ACCOUNT_NAME, process.env.AZURE_ACCOUNT_KEY);
        const blobServiceClient = new BlobServiceClient(storageAccountBaseUrl, sharedKeyCredential);
        const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);
        const blockBlobClient = containerClient.getBlockBlobClient(`myFolder/${file.originalname}`);
        const url = blockBlobClient.uploadData(file.buffer, {
            blockSize: file.size,
            blobHTTPHeaders: {
                blobContentType: file.mimetype,
                blobContentEncoding: file.encoding
            }
        });
        console.log(url);
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