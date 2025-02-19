const { dbConnect } = require('../Data/db.js');
const Team = require('./teamModel.js');
const BrandAmbassador = require('./ambassadorModel.js');
const JOCandidate = require('./JobOrbitModels/JOCandidateModel.js');
const JOExperience = require('./JobOrbitModels/JOExperienceModel.js');
const JOSkills = require('./JobOrbitModels/JOSkillsModel.js');
const JOEducation = require('./JobOrbitModels/JOEducationModel.js');
const JOProjects = require('./JobOrbitModels/JOProjectsModel.js');

BrandAmbassador.hasMany(Team, { foreignKey: 'BA_Code' });
Team.belongsTo(BrandAmbassador, { foreignKey: 'BA_Code' });

JOCandidate.hasMany(JOExperience, { foreignKey: 'CandidateId', onDelete: 'CASCADE' });
JOExperience.belongsTo(JOCandidate, { foreignKey: 'CandidateId' });

JOCandidate.hasMany(JOSkills, { foreignKey: 'CandidateId', onDelete: 'CASCADE' });
JOSkills.belongsTo(JOCandidate, { foreignKey: 'CandidateId' });

JOCandidate.hasMany(JOEducation, { foreignKey: 'CandidateId', onDelete: 'CASCADE' });
JOEducation.belongsTo(JOCandidate, { foreignKey: 'CandidateId' });

JOCandidate.hasMany(JOProjects, { foreignKey: 'CandidateId', onDelete: 'CASCADE' });
JOProjects.belongsTo(JOCandidate, { foreignKey: 'CandidateId' });

dbConnect().then(() => {
    console.log('Database connected and models synchronized.');
}).catch(err => {
    console.error('Error connecting database:', err);
});