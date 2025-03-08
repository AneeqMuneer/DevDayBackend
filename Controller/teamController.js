const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op, Sequelize } = require("sequelize");
const cloudinary = require("../config/cloudinary.js");

const TeamModel = require("../Model/teamModel");
const CompetitionModel = require("../Model/competitionModel");
const { SendTeamRegisterMail } = require("../Utils/teamUtils");
const Team = require("../Model/teamModel");
const AmbassadorModel = require("../Model/ambassadorModel");

exports.RegisterTeam = catchAsyncError(async (req, res, next) => {
    // Debug information
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    
    let { Competition_Name, Institute_Name, Team_Name, L_Name, L_Contact, L_Email, L_CNIC, Members, BA_Code } = req.body;

    // Parse Members if it's a string (common when sent as form-data)
    if (Members && typeof Members === 'string') {
        try {
            Members = JSON.parse(Members);
        } catch (error) {
            return next(new ErrorHandler("Invalid Members format. Please provide a valid JSON array.", 400));
        }
    }

    if (!Competition_Name || !Institute_Name || !Team_Name || !Members || !BA_Code || !L_Name || !L_Contact || !L_Email || !L_CNIC) {
        return next(new ErrorHandler("Please fill the required fields.", 400));
    }

    Team_Name = Team_Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    L_Name = L_Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    for (let member of Members) {
        member.Name = member.Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    }

    // Find competition by name instead of ID
    const competition = await CompetitionModel.findOne({
        where: { Competition_Name }
    });
    
    if (!competition) {
        return next(new ErrorHandler("Competition not found.", 404));
    }

    // Use the found competition's ID for further operations
    const Competition_Id = competition.id;

    const AllTeams = await TeamModel.findAll({
        where: {
            Competition_Id
        }
    });

    if (AllTeams.length >= competition.Max_Registeration) {
        return next(new ErrorHandler("Maximum registration limit reached.", 400));
    }

    if (!Array.isArray(Members) || Members.length < competition.Min_Participants-1 || Members.length > competition.Max_Participants-1) {
        return next(new ErrorHandler("Invalid number of participants.", 400));
    }

    const TeamMembers = [ 
        { 
            Name: L_Name,
            Email: L_Email,
            Contact: L_Contact,
            CNIC: L_CNIC 
        }, 
        ...Members ];

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

        const existingTeam = await TeamModel.findOne({
            where: {
                Competition_Id,
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
                }))
            },
            bind: emailArray
        });

        if (existingTeam) {
            return next(new ErrorHandler("One or more members are already registered in this competition.", 400));
        }
    }

    let paymentPhotoUrl = null;
    if (req.files && req.files.length > 0) {
        try {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'image', folder: 'teams' },
                    (error, result) => {
                        if (error) {
                            reject(new ErrorHandler('Error uploading payment image to Cloudinary', 500));
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                );
                stream.end(req.files[0].buffer);
            });

            paymentPhotoUrl = uploadResult;

        } catch (err) {
            return next(err);
        }
    }

    if (!paymentPhotoUrl) {
        return next(new ErrorHandler("Payment photo is required.", 400));
    }

    const team = await TeamModel.create({
        Competition_Id,
        Institute_Name,
        Team_Name,
        L_Name,
        L_Contact,
        L_Email,
        L_CNIC,
        Members,
        BA_Code,
        Payment_Photo: paymentPhotoUrl
    });

    SendTeamRegisterMail(L_Email, Team_Name, competition.Competition_Name);

    res.status(200).json({
        success: true,
        message: "Team registered successfully.",
        team
    });
});

exports.ProcessPayment = catchAsyncError(async (req, res, next) => {
});

exports.ApprovePayment = catchAsyncError(async (req , res , next) => {
});