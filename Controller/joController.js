const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const { Op, Sequelize } = require("sequelize");
const { joSequelize } = require("../Data/db");
const TokenCreation = require("../Utils/tokenCreation.js");
const bcrypt = require("bcrypt");

const CandidateModel = require("../Model/JobOrbitModels/JOCandidateModel.js");
const EducationModel = require("../Model/JobOrbitModels/JOEducationModel.js")
const ExperienceModel = require("../Model/JobOrbitModels/JOExperienceModel.js");
const CertificationModel = require("../Model/JobOrbitModels/JOCeritificationModel.js");
const ProjectModel = require("../Model/JobOrbitModels/JOProjectModel.js");
const SkillModel = require("../Model/JobOrbitModels/JOSkillModel.js");
const JOJobsModel = require("../Model/JobOrbitModels/JOJobsModel.js");

exports.CandidateSignup = catchAsyncError(async (req, res, next) => {
    const { FirstName, LastName, Gender, Email, Phone, Password } = req.body;

    if (!FirstName || !LastName || !Gender || !Email || !Phone || !Password) {
        return next(new ErrorHandler("Please fill the required fields", 400));
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(Password)) {
        return next(new ErrorHandler("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).", 400));
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

exports.CandidateLogin = catchAsyncError(async (req, res, next) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return next(new ErrorHandler("Please enter Email and Password", 400));
    }

    const Candidate = await CandidateModel.findOne({
        where: {
            Email
        }
    });

    if (!Candidate) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
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

    const transaction = await joSequelize.transaction();

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

exports.RetrieveUserDetail = catchAsyncError(async (req, res, next) => {
    const CandidateId = req.user.Candidate.id;

    const Candidate = await CandidateModel.findOne({
        where: {
            id: CandidateId
        }
    });

    if (!Candidate) {
        return next(new ErrorHandler("Candidate not found", 404));
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

exports.UpdatePersonalDetail = catchAsyncError(async (req, res, next) => {
    const { FirstName, LastName, Phone, Gender, Summary, DomainPreference, CVResume } = req.body;
    const CandidateId = req.user.Candidate.id;

    const Candidate = await CandidateModel.findOne({
        where: {
            id: CandidateId
        }
    });

    if (!Candidate) {
        return next(new ErrorHandler("Candidate not found", 404));
    }

    Candidate.FirstName = FirstName || Candidate.FirstName;
    Candidate.LastName = LastName || Candidate.LastName;
    Candidate.Phone = Phone || Candidate.Phone;
    Candidate.Gender = Gender || Candidate.Gender;
    Candidate.Summary = Summary || Candidate.Summary;
    Candidate.DomainPreference = DomainPreference || Candidate.DomainPreference;
    Candidate.CVResume = CVResume || Candidate.CVResume;

    await Candidate.save();

    res.status(200).json({
        success: true,
        message: "Personal details updated successfully",
        Candidate
    });
});

exports.VerifyOldPassword = catchAsyncError(async (req, res, next) => {
    const { OldPassword } = req.body;
    const CandidateId = req.user.Candidate.id;

    if (!OldPassword) {
        return next(new ErrorHandler("Please enter the required fields", 400));
    }

    const Candidate = await CandidateModel.findOne({
        where: {
            id: CandidateId
        }
    });

    if (!Candidate) {
        return next(new ErrorHandler("Candidate not found", 404));
    }

    const isMatch = await Candidate.comparePassword(OldPassword);

    if (!isMatch) {
        return next(new ErrorHandler("Invalid password", 401));
    }

    req.user.Candidate = Candidate;

    return next();
});

exports.UpdatePassword = catchAsyncError(async (req, res, next) => {
    const { NewPassword, RetypePassword } = req.body;
    const Candidate = req.user.Candidate;

    if (!NewPassword || !RetypePassword) {
        return next(new ErrorHandler("Please enter the required fields", 400));
    }

    if (NewPassword !== RetypePassword) {
        return next(new ErrorHandler("New password and retyped password do not match", 400));
    }

    const hashedPassword = await bcrypt.hash(NewPassword, 10);

    await Candidate.update({
        Password: hashedPassword
    });

    res.status(200).json({
        success: true,
        message: "Password updated successfully"
    });
});

exports.UpdateEducationDetail = catchAsyncError(async (req, res, next) => {
    const { Educations } = req.body;
    const CandidateId = req.user.Candidate.id;

    const transaction = await joSequelize.transaction();

    try {
        let EduIds = Educations.map(e => e.id).filter(id => id !== undefined);

        await EducationModel.destroy({
            where: {
                CandidateId,
                id: {
                    [Op.notIn]: EduIds
                }
            },
            transaction
        });

        for (let edu of Educations) {
            if (!edu.DegreeTitle || !edu.Field || !edu.Institution || !edu.CompletionYear || !edu.Score) {
                throw new ErrorHandler("Please fill all required education fields", 400);
            }

            if (edu.id) {
                await EducationModel.update({
                    DegreeTitle: edu.DegreeTitle,
                    Field: edu.Field,
                    Institution: edu.Institution,
                    CompletionYear: edu.CompletionYear,
                    Score: edu.Score
                }, {
                    where: {
                        id: edu.id,
                        CandidateId
                    },
                    transaction
                });
            } else {
                await EducationModel.create({
                    CandidateId,
                    DegreeTitle: edu.DegreeTitle,
                    Field: edu.Field,
                    Institution: edu.Institution,
                    CompletionYear: edu.CompletionYear,
                    Score: edu.Score
                }, {
                    transaction
                });
            }
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: "Education details updated successfully",
            Education: await EducationModel.findAll({ where: { CandidateId } })
        });
    } catch (error) {
        await transaction.rollback();
        return next(new ErrorHandler(error.message, 400));
    }
});

exports.UpdateExperienceDetail = catchAsyncError(async (req, res, next) => {
    const { Experiences } = req.body;
    const CandidateId = req.user.Candidate.id;

    const transaction = await joSequelize.transaction();

    try {
        let ExpIds = Experiences.map(e => e.id).filter(id => id !== undefined);

        await ExperienceModel.destroy({
            where: {
                CandidateId,
                id: {
                    [Op.notIn]: ExpIds
                }
            },
            transaction
        });

        for (let exp of Experiences) {
            if (!exp.JobTitle || !exp.Company || !exp.StartDate || !exp.Description) {
                throw new ErrorHandler("Please fill all required experience fields", 400);
            }

            if (exp.id) {
                await ExperienceModel.update({
                    JobTitle: exp.JobTitle,
                    Company: exp.Company,
                    StartDate: exp.StartDate,
                    EndDate: exp.EndDate || null,
                    Description: exp.Description
                }, {
                    where: {
                        id: exp.id,
                        CandidateId
                    },
                    transaction
                });
            } else {
                await ExperienceModel.create({
                    CandidateId,
                    JobTitle: exp.JobTitle,
                    Company: exp.Company,
                    StartDate: exp.StartDate,
                    EndDate: exp.EndDate || null,
                    Description: exp.Description
                }, {
                    transaction
                });
            }
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: "Experience details updated successfully",
            Experience: await ExperienceModel.findAll({ where: { CandidateId } })
        });
    } catch (error) {
        await transaction.rollback();
        return next(new ErrorHandler(error.message, 400));
    }
});

exports.UpdateCertificationDetail = catchAsyncError(async (req, res, next) => {
    const { Certifications } = req.body;
    const CandidateId = req.user.Candidate.id;

    const transaction = await joSequelize.transaction();

    try {
        let CertIds = Certifications.map(c => c.id).filter(id => id !== undefined);

        await CertificationModel.destroy({
            where: {
                CandidateId,
                id: {
                    [Op.notIn]: CertIds
                }
            },
            transaction
        });

        for (let cert of Certifications) {
            if (!cert.CertificateName || !cert.IssuingOrganization || !cert.IssueDate || !cert.CertificateLink) {
                throw new ErrorHandler("Please fill all required certification fields", 400);
            }

            if (cert.id) {
                await CertificationModel.update({
                    CertificateName: cert.CertificateName,
                    IssuingOrganization: cert.IssuingOrganization,
                    IssueDate: cert.IssueDate,
                    CertificateLink: cert.CertificateLink
                }, {
                    where: {
                        id: cert.id,
                        CandidateId
                    },
                    transaction
                });
            } else {
                await CertificationModel.create({
                    CandidateId,
                    CertificateName: cert.CertificateName,
                    IssuingOrganization: cert.IssuingOrganization,
                    IssueDate: cert.IssueDate,
                    CertificateLink: cert.CertificateLink
                }, {
                    transaction
                });
            }
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: "Certification details updated successfully",
            Certification: await CertificationModel.findAll({ where: { CandidateId } })
        });
    } catch (error) {
        await transaction.rollback();
        return next(new ErrorHandler(error.message, 400));
    }
});

exports.UpdateProjectDetail = catchAsyncError(async (req, res, next) => {
    const { Projects } = req.body;
    const CandidateId = req.user.Candidate.id;

    const transaction = await joSequelize.transaction();

    try {
        let ProjIds = Projects.map(p => p.id).filter(id => id !== undefined);

        await ProjectModel.destroy({
            where: {
                CandidateId,
                id: {
                    [Op.notIn]: ProjIds
                }
            },
            transaction
        });

        for (let proj of Projects) {
            if (!proj.ProjectTitle || !proj.Description || !proj.URL) {
                throw new ErrorHandler("Please fill all required project fields", 400);
            }

            if (proj.id) {
                await ProjectModel.update({
                    ProjectTitle: proj.ProjectTitle,
                    Description: proj.Description,
                    URL: proj.URL
                }, {
                    where: {
                        id: proj.id,
                        CandidateId
                    },
                    transaction
                });
            } else {
                await ProjectModel.create({
                    CandidateId,
                    ProjectTitle: proj.ProjectTitle,
                    Description: proj.Description,
                    URL: proj.URL
                }, {
                    transaction
                });
            }
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: "Project details updated successfully",
            Project: await ProjectModel.findAll({ where: { CandidateId } })
        });
    } catch (error) {
        await transaction.rollback();
        return next(new ErrorHandler(error.message, 400));
    }
});

exports.UpdateSkillDetail = catchAsyncError(async (req, res, next) => {
    const { Skills } = req.body;
    const CandidateId = req.user.Candidate.id;

    const transaction = await joSequelize.transaction();

    try {
        let SkillIds = Skills.map(s => s.id).filter(id => id !== undefined);

        await SkillModel.destroy({
            where: {
                CandidateId,
                id: {
                    [Op.notIn]: SkillIds
                }
            },
            transaction
        });

        for (let skill of Skills) {
            if (!skill.SkillName) {
                throw new ErrorHandler("Please provide a valid skill name", 400);
            }

            if (skill.id) {
                await SkillModel.update({
                    SkillName: skill.SkillName
                }, {
                    where: {
                        id: skill.id,
                        CandidateId
                    },
                    transaction
                });
            } else {
                await SkillModel.create({
                    CandidateId,
                    SkillName: skill.SkillName
                }, {
                    transaction
                });
            }
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: "Skill details updated successfully",
            Skill: await SkillModel.findAll({ where: { CandidateId } })
        });
    } catch (error) {
        await transaction.rollback();
        return next(new ErrorHandler(error.message, 400));
    }
});

// Add a new job
exports.addJob = catchAsyncError(async (req, res, next) => {
    const { CompanyName, CompanyOverview, Jobs } = req.body;

    if (!CompanyName || !Jobs || !Array.isArray(Jobs)) {
        return next(new ErrorHandler("Please provide required fields (CompanyName and Jobs array)", 400));
    }

    const jobListing = await JOJobsModel.create({
        CompanyName,
        CompanyOverview,
        Jobs
    });

    res.status(201).json({
        success: true,
        message: "Job listing created successfully",
        jobListing
    });
});

// Get all jobs
exports.getAllJobs = catchAsyncError(async (req, res, next) => {
    const jobListings = await JOJobsModel.findAll();

    res.status(200).json({
        success: true,
        count: jobListings.length,
        jobListings
    });
});