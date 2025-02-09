const { dbConnect } = require('../Data/db.js');
const Team = require('./teamModel.js');
const BrandAmbassador = require('./ambassadorModel.js');

BrandAmbassador.hasMany(Team, { foreignKey: 'BA_Code' });
Team.belongsTo(BrandAmbassador, { foreignKey: 'BA_Code' });

dbConnect().then(() => {
    console.log('Database connected and models synchronized.');
}).catch(err => {
    console.error('Error connecting database:', err);
});