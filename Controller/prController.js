const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op, Sequelize } = require("sequelize");
const TokenCreation = require("../Utils/tokenCreation.js");

const { SendTeamRegisterMail } = require("../Utils/teamUtils.js")

const PRModel = require("../Model/prModel");
const TeamModel = require("../Model/teamModel");
const CompetitionModel = require("../Model/competitionModel");

exports.CreatePRMember = catchAsyncError(async (req, res, next) => {
    const { Username } = req.body;
    const Password = Math.random().toString(36).slice(-8);

    if (!Username) {
        return next(new ErrorHandler("Please enter the required details", 400));
    }

    const member = await PRModel.findOne({
        where: {
            Username
        }
    });

    if (member) {
        return next(new ErrorHandler("Another PR member with the same username already exists.", 400));
    }

    const PRMember = await PRModel.create({
        Username,
        Password
    });

    console.log(Password);

    res.status(201).json({
        success: true,
        message: "PR Member Created Successfully",
        data: PRMember
    });
});

exports.PRLogin = catchAsyncError(async (req, res, next) => {
    const { Username, Password } = req.body;

    console.log(req.body);

    const PRMember = await PRModel.findOne({
        where: {
            Username: Username
        }
    });

    if (!PRMember) {
        return next(new ErrorHandler("Invalid Username or Password", 401));
    }

    console.log(PRMember.id);
    const isMatch = await PRMember.comparePassword(Password);

    if (!isMatch) {
        return next(new ErrorHandler("Invalid Username or Password", 401));
    }

    TokenCreation(PRMember, 201, res);
});

exports.RegisterTeam = catchAsyncError(async (req, res, next) => {
    let { Competition_Name, Institute_Name, Team_Name, L_Name, L_Contact, L_Email, L_CNIC, Members } = req.body;
    const PR_Id = req.user.member.id;

    console.log(Team_Name, Competition_Name, Institute_Name, L_Name, L_Contact, L_Email, L_CNIC, Members, PR_Id);

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
        console.log("PR_Id:", PR_Id);
        return next(new ErrorHandler("Please fill the required fields.", 400));
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

    Team_Name = Team_Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    L_Name = L_Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    for (let member of Members) {
        member.Name = member.Name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
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
        BA_Code: PR_Id,
        Payment_Verification_Status: true
    };

    const PRMember = await PRModel.findByPk(PR_Id);
    PRMember.Amount_Owed += competition.Entry_Fee;
    PRMember.Team_Registered_Count = PRMember.Team_Registered_Count + 1;
    await PRMember.save();

    const team = await TeamModel.create(teamData);

    await SendTeamRegisterMail(L_Email, Team_Name, competition.Competition_Name);

    res.status(200).json({
        success: true,
        message: "Team registered successfully.",
        team
    });
});

exports.GetAllRegisteredTeams = catchAsyncError(async (req, res, next) => {
    const member = req.user.member;
    const PR_Id = member.id;

    if (!member || !PR_Id) {
        return next(new ErrorHandler("PR member not found", 404));
    }

    const Teams = await TeamModel.findAll({
        where: {
            BA_Code: PR_Id
        }
    });

    res.status(200).json({
        success: true,
        message: `All Registered Teams -> ${member.Username}`,
        Teams
    });
});

exports.AdminAmountCollect = catchAsyncError(async (req, res, next) => {
    const { PR_Id, Collected_Amount } = req.body;

    const PRMember = await PRModel.findByPk(PR_Id);

    if (!PRMember) {
        return next(new ErrorHandler("Invalid PR Member", 404));
    }

    if (Collected_Amount > PRMember.Amount_Owed) {
        return next(new ErrorHandler("Amount Exceeds the Amount Owed", 400));
    }

    if (Collected_Amount < 0) {
        return next(new ErrorHandler("Invalid amount to be calculated", 400));
    }

    PRMember.Amount_Submitted += Collected_Amount;
    PRMember.Amount_Owed -= Collected_Amount;

    await PRMember.save();

    res.status(200).json({
        success: true,
        message: "Amount Collected Successfully",
        data: PRMember
    });
});

exports.PRMemberAmountReport = catchAsyncError(async (req, res, next) => {
    const PRMembers = await PRModel.findAll();

    if (!PRMembers) {
        return next(new ErrorHandler("Invalid PR Member", 404));
    }

    for (let PRMember of PRMembers) {
        const Teams = await TeamModel.findAll({
            where: {
                BA_Code: PRMember.id
            }
        });

        let Total_Amount = 0;

        for (let team of Teams) {
            const competition = await CompetitionModel.findOne({
                where: {
                    Competition_Name: team.Competition_Name
                }
            });

            if (competition) {
                Total_Amount += competition.Entry_Fee;
            }
        }

        PRMember.setDataValue("Total_Amount", Total_Amount);
    }

    res.status(200).json({
        success: true,
        message: "Amount Report",
        PRMembers
    });
});

exports.MyAmountReport = catchAsyncError(async (req, res, next) => {
    const member = req.user.member;
    const PR_Id = member.id;

    if (!member || !PR_Id) {
        return next(new ErrorHandler("PR member not found", 404));
    }

    const Teams = await TeamModel.findAll({
        where: {
            BA_Code: member.id
        }
    });

    Total_Amount = 0;
    for (let team of Teams) {
        const competition = await CompetitionModel.findOne({
            where: {
                Competition_Name: team.Competition_Name
            }
        });

        if (competition) {
            Total_Amount += competition.Entry_Fee;
        }
    }

    member.setDataValue("Total_Amount", Total_Amount);

    res.status(200).json({
        success: true,
        message: "My Amount Report",
        member
    });
});