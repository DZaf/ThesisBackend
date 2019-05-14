const mongoose = require('mongoose');

const apisioSchema = new mongoose.Schema({ apisioAPI: Object });

module.exports = mongoose.model('Apisio', apisioSchema);