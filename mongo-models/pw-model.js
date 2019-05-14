const mongoose = require('mongoose');

const pwSchema = new mongoose.Schema({ pwAPI: Object });

module.exports = mongoose.model('Api', pwSchema);