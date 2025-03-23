const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../Data/db");
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

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(Password)) {
        return next(new ErrorHandler("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)." , 400));
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

    TokenCreation(Candidate, 201, res);
});

exports.AddUserDetail = catchAsyncError(async (req, res, next) => {
    const { Summary, DomainPreference, CVResume, Education, Experience, Certification, Project, Skill } = req.body;
    const CandidateId = req.user.Candidate.id;

    if (!Summary || !DomainPreference || !CVResume) {
        return next(new ErrorHandler("Please fill the required candidate fields", 400));
    }

    const transaction = await sequelize.transaction();

    try {
        const Candidate = await CandidateModel.findOne({
            where: { id: CandidateId },
            transaction
        });

        if (!Candidate) {
            throw new ErrorHandler("Candidate not found", 404);
        }

        await Candidate.update(
            { Summary, DomainPreference, CVResume, ProfileCreated: true },
            { transaction }
        );

        let educationCount = 0,
            experienceCount = 0,
            certificationCount = 0,
            projectCount = 0,
            skillCount = 0;

        if (Education.length > 0) {
            for (let edu of Education) {
                if (!edu.DegreeTitle || !edu.Field || !edu.Institution || !edu.CompletionYear || !edu.Score) {
                    throw new ErrorHandler("Please fill all required education fields", 400);
                }
            }

            const educationData = Education.map(e => ({
                CandidateId,
                DegreeTitle: e.DegreeTitle,
                Field: e.Field,
                Institution: e.Institution,
                CompletionYear: e.CompletionYear,
                Score: e.Score
            }));

            await EducationModel.bulkCreate(educationData, { transaction });
            educationCount = Education.length;
        }

        if (Experience.length > 0) {
            for (let exp of Experience) {
                if (!exp.JobTitle || !exp.Company || !exp.StartDate || !exp.Description) {
                    throw new ErrorHandler("Please fill all required experience fields", 400);
                }
            }

            const experienceData = Experience.map(e => ({
                CandidateId,
                JobTitle: e.JobTitle,
                Company: e.Company,
                StartDate: e.StartDate,
                EndDate: e.EndDate || null,
                Description: e.Description
            }));

            await ExperienceModel.bulkCreate(experienceData, { transaction });
            experienceCount = Experience.length;
        }

        if (Certification.length > 0) {
            for (let cert of Certification) {
                if (!cert.CertificateName || !cert.IssuingOrganization || !cert.IssueDate || !cert.CertificateLink) {
                    throw new ErrorHandler("Please fill all required certification fields", 400);
                }
            }

            const certificationData = Certification.map(c => ({
                CandidateId,
                CertificateName: c.CertificateName,
                IssuingOrganization: c.IssuingOrganization,
                IssueDate: c.IssueDate,
                CertificateLink: c.CertificateLink
            }));

            await CertificationModel.bulkCreate(certificationData, { transaction });
            certificationCount = Certification.length;
        }

        if (Project.length > 0) {
            for (let proj of Project) {
                if (!proj.ProjectTitle || !proj.Description || !proj.URL) {
                    throw new ErrorHandler("Please fill all required project fields", 400);
                }
            }

            const projectData = Project.map(p => ({
                CandidateId,
                ProjectTitle: p.ProjectTitle,
                Description: p.Description,
                URL: p.URL
            }));

            await ProjectModel.bulkCreate(projectData, { transaction });
            projectCount = Project.length;
        }

        if (Skill.length > 0) {
            for (let skill of Skill) {
                if (!skill) {
                    throw new ErrorHandler("Please provide a valid skill name", 400);
                }
            }

            const skillData = Skill.map(s => ({
                CandidateId,
                SkillName: s
            }));

            await SkillModel.bulkCreate(skillData, { transaction });
            skillCount = Skill.length;
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: "User Detail Added Successfully",
            counts: {
                education: educationCount,
                experience: experienceCount,
                certification: certificationCount,
                project: projectCount,
                skill: skillCount
            }
        });

    } catch (error) {
        await transaction.rollback();
        return next(new ErrorHandler(error.message, 400));
    }
});

exports.RetrieveUserDetail = catchAsyncError(async (req , res , next) => {
    const CandidateId = req.user.Candidate.id;

    const Candidate = await CandidateModel.findOne({
        where: {
            id: CandidateId
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
        Candidate: {
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