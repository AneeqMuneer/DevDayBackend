const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op, Sequelize } = require("sequelize");
const cloudinary = require("../config/cloudinary.js");

const FypModel = require("../Model/fypModel");
const AmbassadorModel = require("../Model/ambassadorModel");
const { SendFypRegisterMail } = require("../Utils/fypUtils.js");

exports.RegisterFyp = catchAsyncError(async (req, res, next) => {
    const { Team_Name, Project_Name, Description, Supervisor, Institution, L_Name, L_Email, L_Contact, L_CNIC, Members, BA_Id } = req.body;

    // if (!Team_Name || !Project_Name || !Description || !Members || !BA_Id || !L_Name || !L_Contact || !L_Email || !L_CNIC || !Institution || !Supervisor) {
    //     return next(new ErrorHandler("Please fill the required fields.", 400));
    // }

    if(!Members) {
        console.log(Members)
        return next(new ErrorHandler("Please fill the required fields.", 400));
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

        const existingTeam = await FypModel.findOne({
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
            return next(new ErrorHandler("One or more members are already registered with a FYP.", 400));
        }
    }

    let reportUrl = null;
    if (req.file) {
        try {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'raw', folder: 'CVs' },
                    (error, result) => {
                        if (error) {
                            reject(new ErrorHandler('Error uploading pdf to Cloudinary', 500));
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                );
                stream.end(req.file.buffer);
            });

            reportUrl = uploadResult;

        } catch (err) {
            return next(err);
        }
    }

    if (reportUrl === null) {
        return next(new ErrorHandler("Project report is required.", 400));
    }

    const ba = await AmbassadorModel.findByPk(BA_Id);

    if (!ba) {
        return next(new ErrorHandler("Brand Ambassador not found.", 404));
    }

    const Fyp = await FypModel.create({
        Team_Name,
        Project_Name,
        Description,
        Supervisor,
        Institution,
        L_Name,
        L_Contact,
        L_Email,
        L_CNIC,
        Members,
        BA_Id,
        Project_Report: reportUrl
    });

    SendFypRegisterMail(L_Email, L_Name);

    res.status(200).json({
        success: true,
        message: "FYP registered successfully.",
        Fyp
    });
});

exports.DownloadFile = catchAsyncError(async (req, res, next) => {
    const { id } = req.query;
    const fyp = await FypModel.findByPk(id);

    if (!fyp) {
        return next(new ErrorHandler("FYP not found", 404));
    }

    res.setHeader("Content-Disposition", `attachment; filename=${fyp.projectName}.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(fyp.document);
});