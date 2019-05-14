var express = require('express');
const ApiGuru = require('../../mongo-models/apiguru-model')
const mongoose = require("mongoose");
const router = express.Router();
var data = require('./apisguru.json');

mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
});

router.get('/', function (req, res, next) {
    res.send('respond apiguru crawler');
});

router.get('/all', function(req, res) {
    console.log("hi")
    data.forEach(element => {
        console.log(element);
        const apiguru = new ApiGuru({ apiguru: element });
        apiguru.save()
            .then(result => {
                console.log("ok");
            })
            .catch(err => {
                console.log(err);
            });
    });

});

module.exports = router;