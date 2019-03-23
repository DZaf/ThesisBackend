const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    surname: String,
    email: String,
    password: String
});

module.exports = mongoose.model('User',productSchema);