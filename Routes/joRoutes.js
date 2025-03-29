const express = require("express");
const { CandidateLogin , CandidateSignup , RetrieveUserDetail , AddUserDetail , UpdatePersonalDetail , UpdateCertificationDetail , UpdateEducationDetail , UpdateExperienceDetail , UpdateProjectDetail , UpdateSkillDetail , VerifyOldPassword , UpdatePassword } = require("../Controller/joController");
const { VerifyCandidate } = require("../Middleware/candidateAuth");
const router = express.Router();

router.route("/CandidateLogin").post(CandidateLogin);
router.route("/CandidateSignup").post(CandidateSignup);
router.route("/AddUserDetail").post(VerifyCandidate , AddUserDetail);
router.route("/RetrieveUserDetail").get(VerifyCandidate , RetrieveUserDetail);
router.route("/UpdatePersonalDetail").put(VerifyCandidate , UpdatePersonalDetail);
router.route("/UpdatePassword").put(VerifyCandidate , VerifyOldPassword , UpdatePassword);
router.route("/UpdateEducationDetail").put(VerifyCandidate , UpdateEducationDetail);
router.route("/UpdateExperienceDetail").put(VerifyCandidate , UpdateExperienceDetail);
router.route("/UpdateCertificationDetail").put(VerifyCandidate , UpdateCertificationDetail);
router.route("/UpdateProjectDetail").put(VerifyCandidate , UpdateProjectDetail);
router.route("/UpdateSkillDetail").put(VerifyCandidate , UpdateSkillDetail);

module.exports = router;