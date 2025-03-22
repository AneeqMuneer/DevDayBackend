const { dbConnect } = require('../Data/db.js');
const JOCandidate = require('./JobOrbitModels/JOCandidateModel.js');
const JOExperience = require('./JobOrbitModels/JOExperienceModel.js');
const JOSkills = require('./JobOrbitModels/JOSkillModel.js');
const JOEducation = require('./JobOrbitModels/JOEducationModel.js');
const JOProjects = require('./JobOrbitModels/JOProjectModel.js');
const JOCertifications = require('./JobOrbitModels/JOCeritificationModel.js');

JOCandidate.hasMany(JOExperience, { foreignKey: 'CandidateId', onDelete: 'CASCADE' });
JOExperience.belongsTo(JOCandidate, { foreignKey: 'CandidateId' });

JOCandidate.hasMany(JOSkills, { foreignKey: 'CandidateId', onDelete: 'CASCADE' });
JOSkills.belongsTo(JOCandidate, { foreignKey: 'CandidateId' });

JOCandidate.hasMany(JOEducation, { foreignKey: 'CandidateId', onDelete: 'CASCADE' });
JOEducation.belongsTo(JOCandidate, { foreignKey: 'CandidateId' });

JOCandidate.hasMany(JOProjects, { foreignKey: 'CandidateId', onDelete: 'CASCADE' });
JOProjects.belongsTo(JOCandidate, { foreignKey: 'CandidateId' });

JOCandidate.hasMany(JOCertifications, { foreignKey: 'CandidateId', onDelete: 'CASCADE' });
JOCertifications.belongsTo(JOCandidate, { foreignKey: 'CandidateId' });

dbConnect().then(() => {
    console.log('Database connected and models synchronized.');
}).catch(err => {
    console.error('Error connecting database:', err);
});