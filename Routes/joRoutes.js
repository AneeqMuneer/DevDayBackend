const express = require("express");
const { CandidateLogin, CandidateSignup, RetrieveUserDetail, AddUserDetail, UpdatePersonalDetail, UpdateCertificationDetail, UpdateEducationDetail, UpdateExperienceDetail, UpdateProjectDetail, UpdateSkillDetail, VerifyOldPassword, UpdatePassword, AddJob, GetAllJobs, ForgotPassword, VerifyAuthCode, ResetPassword } = require("../Controller/joController");
const { VerifyCandidate } = require("../Middleware/candidateAuth");
const router = express.Router();

router.route("/CandidateLogin").post(CandidateLogin);
router.route("/CandidateSignup").post(CandidateSignup);
router.route("/ForgotPassword").put(ForgotPassword);
router.route("/VerifyAuthCode").put(VerifyAuthCode);
router.route("/ResetPassword").put(ResetPassword);
router.route("/AddUserDetail").post(VerifyCandidate, AddUserDetail);
router.route("/RetrieveUserDetail").get(VerifyCandidate, RetrieveUserDetail);
router.route("/UpdatePersonalDetail").put(VerifyCandidate, UpdatePersonalDetail);
router.route("/UpdatePassword").put(VerifyCandidate, VerifyOldPassword, UpdatePassword);
router.route("/UpdateEducationDetail").put(VerifyCandidate, UpdateEducationDetail);
router.route("/UpdateExperienceDetail").put(VerifyCandidate, UpdateExperienceDetail);
router.route("/UpdateCertificationDetail").put(VerifyCandidate, UpdateCertificationDetail);
router.route("/UpdateProjectDetail").put(VerifyCandidate, UpdateProjectDetail);
router.route("/UpdateSkillDetail").put(VerifyCandidate, UpdateSkillDetail);

router.route("/AddJob").post(AddJob).get(GetAllJobs);
router.route("/RetrieveJobs").get(GetAllJobs);

module.exports = router;