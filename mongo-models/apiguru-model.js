const mongoose = require('mongoose');

const Apiguru = new mongoose.Schema({ apiguru: Object });

module.exports = mongoose.model('ApiGuru', Apiguru);