const ErrorHandler = require("../Utils/errorHandler");
const catchAsyncError = require("../Middleware/asyncError");
const TokenCreation = require("../Utils/tokenCreation");
const cloudinary = require("../config/cloudinary.js");
const { Op, Sequelize: sequelize } = require("sequelize");
const bcrypt = require("bcrypt");

const AmbassadorModel = require("../Model/ambassadorModel");
const TeamModel = require("../Model/teamModel");

const { SendRegistrationEmail , CreateCode , GenerateRandomPassword , SendApprovePasswordEmail } = require("../Utils/ambassadorUtils");

exports.Login = catchAsyncError(async (req, res, next) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return next(new ErrorHandler("Please enter Email and Password.", 400));
    }

    const Ambassador = await AmbassadorModel.findOne({
        where: { Email }
    });

    if (!Ambassador) {
        return next(new ErrorHandler("Invalid Email or Password.", 401));
    }

    const isPasswordMatched = await Ambassador.comparePassword(Password);
    const isApproved = Ambassador.Approval;

    if (!isApproved) {
        return next(new ErrorHandler("Your account is not approved yet.", 401));
    }

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password.", 401));
    }

    const data = await AmbassadorModel.findOne({
        where: { id: Ambassador.id }
    });

    TokenCreation(data, 200, res);
});

exports.SignUp = catchAsyncError(async (req, res, next) => {
    const { Name, Contact, Email, CNIC, Institution, Instagram_Handle } = req.body;

    if (!Name || !Email || !Contact || !CNIC || !Institution) {
        return next(new ErrorHandler("Please fill the remaining fields.", 400));
    }

    let Code;
    do {
        Code = CreateCode(Name, Institution);
        var anotherAmbassador = await AmbassadorModel.findAll({ where: { Code } });
    } while (anotherAmbassador.length > 0);

    let profilePhotoUrl = null;
    if (req.file) {
        try {
            const uploadResult = await new Promise((resolve, reject) => {
                if (!req.file.buffer) {
                    return reject(new ErrorHandler('Invalid file data', 400));
                }
                
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'image', folder: 'ambassadors' },
                    (error, result) => {
                        if (error) {
                            reject(new ErrorHandler('Error uploading image to Cloudinary', 500));
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                );
                
                stream.write(req.file.buffer);
                stream.end();
            });

            profilePhotoUrl = uploadResult;

        } catch (err) {
            return next(err);
        }
    }

    try {
        const ambassador = await AmbassadorModel.create({
            Code,
            Name,
            Contact,
            Email,
            CNIC,
            Institution,
            Instagram_Handle,
            ProfilePhoto: profilePhotoUrl
        });

        await SendRegistrationEmail(ambassador.Email, ambassador.Name);

        res.status(200).json({
            success: true,
            message: "Ambassador sign-up successful",
            ambassador
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Error creating ambassador", 500));
    }
});

exports.GetAllBARegistration = catchAsyncError(async (req, res, next) => {
    const { code } = req.query;

    if (!code) {
        return next(new ErrorHandler("Please provide a Code", 400));
    }
    
    const ambassador = await AmbassadorModel.findOne({ where: { Code: code } });
    
    if (!ambassador) {
        return next(new ErrorHandler("Ambassador not found", 404));
    }

    // Get all BAs
    const ambassadors = await AmbassadorModel.findAll({
        attributes: ['Code'],
        raw: true
    });

    // Get all team counts
    const teamCounts = await TeamModel.findAll({
        attributes: [
            'BA_Code',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['BA_Code'],
        raw: true
    });

    // Create a map of BA_Code to team count
    const countMap = new Map(teamCounts.map(t => [t.BA_Code, parseInt(t.count)]));

    // Add referral counts to ambassadors
    const ambassadorsWithCounts = ambassadors.map(ba => ({
        ...ba,
        referralCount: countMap.get(ba.Code) || 0
    }));

    // Sort by referral count in descending order
    const sortedBAs = ambassadorsWithCounts.sort((a, b) => b.referralCount - a.referralCount);

    // Calculate dense ranking
    let currentRank = 1;
    let currentCount = sortedBAs[0]?.referralCount || 0;
    let rank = 1;
    
    // Find rank for the requested BA
    for (const ba of sortedBAs) {
        if (ba.referralCount < currentCount) {
            currentRank = rank;
            currentCount = ba.referralCount;
        }
        if (ba.Code === code) {
            rank = currentRank;
            break;
        }
        rank++;
    }
    
    // Get teams for the requested BA
    const teams = await TeamModel.findAll({ where: { BA_Code: code } });
    
    res.status(200).json({
        success: true,
        count: teams.length,
        rank,
        teams
    });
});

exports.Leaderboard = catchAsyncError(async (req, res, next) => {
    // Get all BAs
    const ambassadors = await AmbassadorModel.findAll({
        attributes: ['Code', 'Name', 'ProfilePhoto'],
        raw: true
    });

    // Get all team counts
    const teamCounts = await TeamModel.findAll({
        attributes: [
            'BA_Code',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['BA_Code'],
        raw: true
    });

    // Create a map of BA_Code to team count
    const countMap = new Map(teamCounts.map(t => [t.BA_Code, parseInt(t.count)]));

    // Add referral counts to ambassadors
    const ambassadorsWithCounts = ambassadors.map(ba => ({
        ...ba,
        referralCount: countMap.get(ba.Code) || 0
    }));

    // Sort by referral count in descending order
    const sortedBAs = ambassadorsWithCounts.sort((a, b) => b.referralCount - a.referralCount);

    // Calculate dense ranking
    let currentRank = 1;
    let currentCount = sortedBAs[0]?.referralCount || 0;
    let rank = 1;
    
    const rankedBAs = sortedBAs.map(ba => {
        if (ba.referralCount < currentCount) {
            currentRank = rank;
            currentCount = ba.referralCount;
        }
        rank++;

        // Only include ProfilePhoto for top 3
        const isTop3 = currentRank <= 3;
        return {
            rank: currentRank,
            code: ba.Code,
            name: ba.Name,
            referralCount: ba.referralCount,
            ...(isTop3 && ba.ProfilePhoto ? { profilePhoto: ba.ProfilePhoto } : {})
        };
    });

    res.status(200).json({
        success: true,
        count: rankedBAs.length,
        leaderboard: rankedBAs
    });
});

exports.ChangeOldPassword = catchAsyncError(async (req, res, next) => {
    const { OldPassword } = req.body;
    const id = req.user.Ambassador.id;
    
    if (!OldPassword || !id) {
        return next(new ErrorHandler("Please provide the required details", 400));
    }
    
    const ambassador = await AmbassadorModel.findByPk(id);
    
    if (!ambassador) {
        return next(new ErrorHandler("Ambassador not found", 404));
    }

    const isPasswordMatched = await ambassador.comparePassword(OldPassword);
    
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is incorrect", 400));
    }

    req.body.ambassador = ambassador;

    return next();
});

exports.UpdatePassword = catchAsyncError(async (req, res, next) => {
    const { ambassador, NewPassword } = req.body;
    
    if (!ambassador) {
        return next(new ErrorHandler("Ambassador not found", 400));
    }
    
    if (!NewPassword) {
        return next(new ErrorHandler("Please provide a new password", 400));
    }
    
    ambassador.Password = await bcrypt.hash(NewPassword, 10);
    await ambassador.save();
    
    res.status(200).json({
        success: true,
        message: "Password updated successfully"
    });
});

exports.GetAllAmbassador = catchAsyncError(async (req, res, next) => {
    const ambassadors = await AmbassadorModel.findAll({
        attributes: { exclude: ['Password', 'createdAt', 'updatedAt'] } // Exclude password from the response
    });

    res.status(200).json({
        success: true,
        count: ambassadors.length,
        ambassadors
    });
});

exports.GetAmbassadorById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ErrorHandler("Please provide an ambassador ID", 400));
    }

    const ambassador = await AmbassadorModel.findByPk(id, {
        attributes: { exclude: ['Password', 'createdAt', 'updatedAt'] }
    });

    if (!ambassador) {
        return next(new ErrorHandler("Ambassador not found", 404));
    }

    res.status(200).json({
        success: true,
        ambassador
    });
});

exports.GetAmbassadorByCode = catchAsyncError(async (req, res, next) => {
    const { code } = req.body;

    if (!code) {
        return next(new ErrorHandler("Please provide a code", 400));
    }

    const ambassador = await AmbassadorModel.findOne({
        where: {
            Code: code
        },
        attributes: { exclude: ['Password'] }
    });

    if (!ambassador) {
        return next(new ErrorHandler("Ambassador not found", 404));
    }

    res.status(200).json({
        success: true,
        ambassador
    });
});

exports.ApproveBAs = catchAsyncError(async (req, res, next) => {
    const { SelectedMembers } = req.body;

    if (!SelectedMembers || !Array.isArray(SelectedMembers) || SelectedMembers.length === 0) {
        return next(new ErrorHandler("Please fill the required fields", 400));
    }

    const ids = SelectedMembers.map(member => member.id);

    const ambassadors = await AmbassadorModel.findAll({
        where: {
            id: ids
        }
    });

    if (ambassadors.length === 0) {
        return next(new ErrorHandler("No ambassadors found with the provided IDs", 404));
    }

    if (ambassadors.length < SelectedMembers.length) {
        return next(new ErrorHandler("Some ambassadors were not found", 400));
    }

    const updatedAmbassadors = [];
    const emailPromises = [];

    for (const ambassador of ambassadors) {
        const selectedMember = SelectedMembers.find(member => member.id === ambassador.id);
        const newCode = selectedMember.code;

        ambassador.Approval = true;
        ambassador.Code = newCode;
        const pass = await GenerateRandomPassword();
        ambassador.Password = await bcrypt.hash(pass, 10);

        console.log(pass);

        emailPromises.push(SendApprovePasswordEmail(ambassador.Email, ambassador.Name, newCode , pass));
        await ambassador.save();

        updatedAmbassadors.push(ambassador);
    }

    await Promise.all(emailPromises);

    res.status(200).json({
        success: true,
        message: `${updatedAmbassadors.length} ambassador(s) approved successfully`,
        approvedAmbassadors: updatedAmbassadors.map(a => ({ id: a.id, name: a.Name, code: a.Code }))
    });
});

// Not finished
exports.DeleteBAs = catchAsyncError(async (req, res, next) => {
    const { UnnecessaryMembers } = req.body;

    if (!UnnecessaryMembers || !Array.isArray(UnnecessaryMembers) || UnnecessaryMembers.length === 0) {
        return next(new ErrorHandler("UnnecessaryMembers must be a non-empty array of valid IDs." , 400));
    }

    const result = await AmbassadorModel.destroy({
        where: {
            id: { [Op.notIn]: UnnecessaryMembers }
        }
    });

    res.status(200).json({
        success: true,
        message: `${result} Brand Ambassador(s) deleted successfully.`,
    });
});
