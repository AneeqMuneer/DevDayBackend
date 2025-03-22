const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op, Sequelize } = require("sequelize");
const TokenCreation = require("../Utils/tokenCreation.js");

const CandidateModel = require("../Model/JobOrbitModels/JOCandidateModel.js");
const EducationModel = require("../Model/JobOrbitModels/JOEducationModel.js")
const ExperienceModel = require("../Model/JobOrbitModels/JOExperienceModel.js");
const CertificationModel = require("../Model/JobOrbitModels/JOCeritificationModel.js");
const ProjectModel = require("../Model/JobOrbitModels/JOProjectModel.js");
const SkillModel = require("../Model/JobOrbitModels/JOSkillModel.js");

exports.CandidateSignup = catchAsyncError(async (req , res , next) => {
    const { FirstName , LastName , Gender , Email , Phone , Password } = req.body;

    if (!FirstName || !LastName || !Gender || !Email || !Phone || !Password) {
        return next(new ErrorHandler("Please fill the required fields" , 400));
    }

    const Candidate = await CandidateModel.create({
        FirstName,
        LastName,
        Gender,
        Email,
        Phone,
        Password
    });

    res.status(201).json({
        success: true,
        message: "Candidate Registered Successfully",
        Candidate
    });
});

exports.CandidateLogin = catchAsyncError(async (req , res , next) => {
    const { Email , Password } = req.body;

    if (!Email || !Password) {
        return next(new ErrorHandler("Please enter Email and Password" , 400));
    }

    const Candidate = await CandidateModel.findOne({
        where: {
            Email
        }
    });

    if (!Candidate) {
        return next(new ErrorHandler("Invalid Email or Password" , 401));
    }

    const isMatch = await Candidate.comparePassword(Password);

    if (!isMatch) {
        return next(new ErrorHandler("Invalid Username or Password", 401));
    }

    TokenCreation(PRMember, 201, res);
});

exports.AddUserDetail = catchAsyncError(async (req , res , next) => {
    const { Summary , DomainPreference , CVResume , Education , Experience , Certification , Project , Skill } = req.body;
    const CandidateID = req.user.Candidate.id;

    if (!Summary || !DomainPreference || !CVResume) {
        return next(new ErrorHandler("Please fill the required candidate fields" , 400));
    }

    const Candidate = await CandidateModel.findOne({
        where: {
            CandidateID
        }
    });

    if (!Candidate) {
        return next(new ErrorHandler("Candidate not found" , 404));
    }

    Candidate.Summary = Summary;
    Candidate.DomainPreference = DomainPreference;
    Candidate.CVResume = CVResume;
    await Candidate.save();

    let EducationCount = 0;
    let ExperienceCount = 0;
    let CertificationCount = 0;
    let ProjectCount = 0;
    let SkillCount = 0;

    for (let i = 0; i < Education.length; i++) {
        if (!Education[i].DegreeTitle || !Education[i].Field || !Education[i].Institution || !Education[i].CompletionYear || !Score) {
            return next(new ErrorHandler("Please fill the required education fields" , 400));
        }

        const EducationDetail = await EducationModel.create({
            CandidateID,
            DegreeTitle: Education[i].DegreeTitle,
            Field: Education[i].Field,
            Institution: Education[i].Institution,
            CompletionYear: Education[i].CompletionYear,
            Score: Education[i].Score
        });

        if (!EducationDetail) {
            return next(new ErrorHandler("Education Detail not added" , 400));
        }

        EducationCount++;
    }

    for (let i = 0; i < Experience.length; i++) {
        if (!Experience[i].JobTitle || !Experience[i].Company || !Experience[i].StartDate || !Experience[i].EndDate || !Experience[i].Description) {
            return next(new ErrorHandler("Please fill the required experience fields" , 400));
        }

        const ExperienceDetail = await ExperienceModel.create({
            CandidateID,
            JobTitle: Experience[i].JobTitle,
            Company: Experience[i].Company,
            StartDate: Experience[i].StartDate,
            EndDate: Experience[i].EndDate,
            Description: Experience[i].Description
        });

        if (!ExperienceDetail) {
            return next(new ErrorHandler("Experience Detail not added" , 400));
        }

        ExperienceCount++;
    }

    for (let i = 0; i < Certification.length; i++) {
        if (!Certification[i].CertificateName || !Certification[i].IssuingOrganization || !Certification[i].IssueDate || !Certification[i].CertificateLink) {
            return next(new ErrorHandler("Please fill the required certification fields" , 400));
        }

        const CertificationDetail = await CertificationModel.create({
            CandidateID,
            CertificateName: Certification[i].CertificateName,
            IssuingOrganization: Certification[i].IssuingOrganization,
            IssueDate: Certification[i].IssueDate,
            CertificateLink: Certification[i].CertificateLink
        });

        if (!CertificationDetail) {
            return next(new ErrorHandler("Certification Detail not added" , 400));
        }

        CertificationCount++;
    }

    for (let i = 0; i < Project.length; i++) {
        if (!Project[i].ProjectTitle || !Project[i].Description || !Project[i].URL) {
            return next(new ErrorHandler("Please fill the required project fields" , 400));
        }

        const ProjectDetail = await ProjectModel.create({
            CandidateID,
            ProjectTitle: Project[i].ProjectTitle,
            Description: Project[i].Description,
            URL: Project[i].URL
        });

        if (!ProjectDetail) {
            return next(new ErrorHandler("Project Detail not added" , 400));
        }

        ProjectCount++;
    }

    for (let i = 0; i < Skill.length; i++) {
        if (!Skill[i].SkillName) {
            return next(new ErrorHandler("Please fill the required skill fields" , 400));
        }

        const SkillDetail = await SkillModel.create({
            CandidateID,
            SkillName: Skill[i].SkillName
        });

        if (!SkillDetail) {
            return next(new ErrorHandler("Skill Detail not added" , 400));
        }

        SkillCount++;
    }

    res.status(201).json({
        success: true,
        message: "User Detail Added Successfully",
        EducationCount,
        ExperienceCount,
        CertificationCount,
        ProjectCount,
        SkillCount
    });
});

exports.RetrieveUserDetail = catchAsyncError(async (req , res , next) => {
    const CandidateId = req.user.Candidate.id;

    const Candidate = await CandidateModel.findOne({
        where: {
            CandidateId
        }
    });

    if (!Candidate) {
        return next(new ErrorHandler("Candidate not found" , 404));
    }

    const Education = await EducationModel.findAll({
        where: {
            CandidateId
        }
    });

    const Experience = await ExperienceModel.findAll({
        where: {
            CandidateId
        }
    });

    const Certification = await CertificationModel.findAll({
        where: {
            CandidateId
        }
    });

    const Project = await ProjectModel.findAll({
        where: {
            CandidateId
        }
    });

    const Skill = await SkillModel.findAll({
        where: {
            CandidateId
        }
    });

    res.status(200).json({
        success: true,
        Candidate,
        CandidateDetails: {
            id: Candidate.id,
            FirstName: Candidate.FirstName,
            LastName: Candidate.LastName,
            Gender: Candidate.Gender,
            Phone: Candidate.Phone,
            Email: Candidate.Email,
            Password: Candidate.Password,
            Summary: Candidate.Summary,
            DomainPreference: Candidate.DomainPreference,
            CVResume: Candidate.CVResume,
            Education,
            Experience,
            Certification,
            Project,
            Skill
        }
    });
});