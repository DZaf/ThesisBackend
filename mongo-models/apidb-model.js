const mongoose = require('mongoose');

const apidb = new mongoose.Schema({api: Object});

module.exports = mongoose.model('ApiDB', apidb);