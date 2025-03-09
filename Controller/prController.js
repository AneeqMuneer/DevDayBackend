const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op, Sequelize } = require("sequelize");

const PRModel = require("../Model/prModel");
const TeamModel = require("../Model/teamModel");
const CompetitionModel = require("../Model/competitionModel");

exports.CreatePRMember = catchAsyncError((req, res, next) => {
    const { Username } = req.body;
    const password = Math.random().toString(36).slice(-8);
    console.log(password);
    const hashedPassword = bcrypt.hash(password, 10);
    
    const PRMember = PRModel.create({
        Username: Username,
        Password: hashedPassword
    });

    res.status(201).json({
        success: true,
        message: "PR Member Created Successfully",
        data: PRMember
    });
});

exports.PRLogin = catchAsyncError((req, res, next) => {
    const { Username, Password } = req.body;

    const PRMember = PRModel.findOne({
        where: {
            Username: Username
        }
    });

    if(!PRMember) {
        return next(new ErrorHandler("Invalid Username or Password", 401));
    }

    const isMatch = PRModel.comparePassword(Password);

    if(!isMatch) {
        return next(new ErrorHandler("Invalid Username or Password", 401));
    }

    res.status(200).json({
        success: true,
        message: "PR Member Logged In Successfully",
        data: PRMember
    });
});

exports.RegisterTeam = catchAsyncError((req, res, next) => {

});

exports.GetAllRegisteredTeams = catchAsyncError((req, res, next) => {
    const { PR_Id } = req.body;

    const PRMember = PRModel.findByPk(PR_Id);

    if(!PRMember) {
        return next(new ErrorHandler("Invalid PR Member Id", 404));
    }
    
    const Teams = TeamModel.findAll({
        where: {
            BA_Code: PR_Id
        }
    });

    res.status(200).json({
        success: true,
        message: "All Registered Teams",
        Teams
    });
});

exports.AdminAmountCollect = catchAsyncError((req, res, next) => {
    const { PR_Id , Collected_Amount } = req.body;

    const PRMember = PRModel.findByPk(PR_Id);

    if(!PRMember) {
        return next(new ErrorHandler("Invalid PR Member", 404));
    }

    PRMember.Amount_Submitted += Collected_Amount;
    PRMember.Amount_Owed -= Collected_Amount;

    PRMember.save();

    res.status(200).json({
        success: true,
        message: "Amount Collected Successfully",
        data: PRMember
    });
});

exports.PRMemberAmountReport = catchAsyncError((req, res, next) => {
    const { PR_Id } = req.body;

    const PRMember = PRModel.findByPk(PR_Id);

    if(!PRMember) {
        return next(new ErrorHandler("Invalid PR Member", 404));
    }

    const Teams = TeamModel.findAll({
        where: {
            BA_Code: PR_Id
        }
    });

    let Total_Amount = 0;
    Teams.forEach(team => {
        const competition = CompetitionModel.findOne({
            where: {
                Competition_Name: team.Competition_Name
            }
        });

        Total_Amount += competition.Entry_Fee;
    });


    res.status(200).json({
        success: true,
        message: "Amount Report",
        Amount_Submitted: PRMember.Amount_Submitted,
        Amount_Owed: PRMember.Amount_Owed,
        Total_Amount
    });
}) 