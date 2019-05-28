const mongoose = require('mongoose');

const pwPlusApisioSchema = new mongoose.Schema({ firstObject: Object, secondObject: Object });

module.exports = mongoose.model('pwPlusApisio', pwPlusApisioSchema);