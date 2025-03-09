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
    console.log("Request body:", JSON.stringify(req.body));
    console.log("Request files:", req.files ? `Files exist: ${req.files.length}` : "No files");

    let { Competition_Name, Institute_Name, Team_Name, L_Name, L_Contact, L_Email, L_CNIC, Members, BA_Code } = req.body;

    // Parse Members if it's a string (common when sent as form-data)
    if (typeof Members === 'string' && Members.trim() !== '') {
        try {
            console.log("Parsing Members JSON string");
            Members = JSON.parse(Members);
            console.log("Parsed Members:", Members);
        } catch (error) {
            console.log("Error parsing Members:", error);
            return next(new ErrorHandler("Invalid Members format. Please provide a valid JSON array.", 400));
        }
    }

    if (!Competition_Name || !Institute_Name || !Team_Name || !L_Name || !L_Contact || !L_Email || !L_CNIC) {
        console.log("Missing required fields");
        console.log("Competition_Name:", Competition_Name);
        console.log("Institute_Name:", Institute_Name);
        console.log("Team_Name:", Team_Name);
        console.log("Members:", Members);
        console.log("L_Name:", L_Name);
        console.log("L_Contact:", L_Contact);
        console.log("L_Email:", L_Email);
        console.log("L_CNIC:", L_CNIC);
        return next(new ErrorHandler("Please fill the required fields.", 400));
    }

    Team_Name = Team_Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    L_Name = L_Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    for (let member of Members) {
        member.Name = member.Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    }

    // Find competition by name
    const competition = await CompetitionModel.findOne({
        where: { Competition_Name }
    });

    if (!competition) {
        return next(new ErrorHandler("Competition not found.", 404));
    }

    const AllTeams = await TeamModel.findAll({
        where: {
            Competition_Name
        }
    });

    if (AllTeams.length >= competition.Max_Registeration) {
        return next(new ErrorHandler("Maximum registration limit reached.", 400));
    }

    if (!Array.isArray(Members) || Members.length < competition.Min_Participants - 1 || Members.length > competition.Max_Participants - 1) {
        return next(new ErrorHandler("Invalid number of participants.", 400));
    }

    if (Members === undefined) {
        Members = [];
    }

    const TeamMembers = [
        {
            Name: L_Name,
            Email: L_Email,
            Contact: L_Contact,
            CNIC: L_CNIC
        },
        ...Members];

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
                Competition_Name,
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
    // Check both req.files (array format) and req.file (single file format)
    if ((req.files && req.files.length > 0) || req.file) {
        console.log("Processing payment photo upload");

        // Get the file from either req.files array or req.file
        const file = req.files && req.files.length > 0 ? req.files[0] : req.file;

        console.log("File details:", {
            mimetype: file.mimetype,
            size: file.size,
            hasBuffer: !!file.buffer
        });

        try {
            const uploadResult = await new Promise((resolve, reject) => {
                if (!file.buffer) {
                    console.log("No buffer in payment photo file");
                    return reject(new ErrorHandler('Invalid file data', 400));
                }

                console.log("Creating upload stream for payment photo");
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'image', folder: 'teams' },
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
                stream.write(file.buffer);
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
        console.log("No payment photo file found in request");
    }

    if (!paymentPhotoUrl) {
        console.log("Payment photo URL is missing");
        return next(new ErrorHandler("Payment photo is required.", 400));
    }

    const teamData = {
        Competition_Name,
        Institute_Name,
        Team_Name,
        L_Name,
        L_Contact,
        L_Email,
        L_CNIC,
        Members,
        Payment_Photo: paymentPhotoUrl
    };

    // Only add BA_Code to the team data if it exists
    if (BA_Code) {
        teamData.BA_Code = BA_Code;
    }

    const team = await TeamModel.create(teamData);

    SendTeamRegisterMail(L_Email, Team_Name, competition.Competition_Name);

    res.status(200).json({
        success: true,
        message: "Team registered successfully.",
        team
    });
});

exports.ProcessPayment = catchAsyncError(async (req, res, next) => {
});

exports.ApprovePayment = catchAsyncError(async (req, res, next) => {
});