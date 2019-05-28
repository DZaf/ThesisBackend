var express = require('express');
const mongoose = require("mongoose");
const pw = require('../mongo-models/pw-model.js')
const apisio = require('../mongo-models/apis-model')
const apiguru = require('../mongo-models/apiguru-model')
const PwPlusApisio = require('../mongo-models/pwPlusApisio-model')
const router = express.Router();
//const fs = require('fs');

mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
});

router.get('/', function (req, res, next) {
    res.send('respond pw and apis io comparison');
});

router.get('/pw/apisio', function (req, res, next) {

    pw.find({}).stream()
        .on('data', function (doc) {
            //var pwApiTitle = doc.pwAPI["API Title"].replace(/ API$/g, '');
            var pwApiEndpoint = doc.pwAPI["API Endpoint"];

            if (pwApiEndpoint) {
                pwApiEndpoint = pwApiEndpoint.replace(/https?:\/\//g, '');
                pwApiEndpoint = pwApiEndpoint.replace(/\/[\W?\w?]*$/g, '');
                apisio.find({ "apisioAPI.baseURL": { $regex: '.*' + pwApiEndpoint + '.*' } }, function (err, result) {
                    if (err) throw err;
                    if (result.length > 0) {
                        addTo(doc, result[0]);
                        console.log(result[0].apisioAPI.baseURL + " = " + pwApiEndpoint);
                    }
                    else {
                        add(doc);
                        console.log("-------------" + pwApiEndpoint);
                    }

                });
            } else {
                var pwApiHomePage = doc.pwAPI["API Portal / Home Page"];
                apisio.find({ "apisioAPI.humanURL": pwApiHomePage }, function (err, result) {
                    if (err) throw err;
                    if (result.length > 0) {
                        addTo(doc, result[0]);
                        console.log(result[0].apisioAPI.humanURL + " = " + pwApiHomePage);
                    }
                    else {
                        add(doc);
                        console.log("====================" + pwApiHomePage);
                    }
                });
            }

        })
        .on('error', function (err) {
            // handle error
        })
        .on('end', function () {
            // final callback
        });
    res.send("ok");
});

router.get('/apiguru/apisio', function (req, res, next) {

    apiguru.find({}).stream()
        .on('data', function (doc) {
            var version = doc.apiguru["preferred"];
            var url = doc.apiguru.versions[version].info["x-providerName"];
            apisio.find({ "apisioAPI.humanURL": { $regex: '.*' + url + '.*' } }, function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    addTo(doc, result[0]);
                    //console.log(result[0].apisioAPI.humanURL + " = " + url);
                }
                else{
                    add(doc);
                }

            });
        })
        .on('error', function (err) {
            // handle error
        })
        .on('end', function () {
            console.log("hey im done")
        });
    res.send("ok /apisio/apiguru");
});


router.get('/add/apisio', function (req, res, next) {
    
    apisio.find({}).stream()
    .on('data', function (doc) {
        checkIfExists(doc)
    })
    .on('error', function (err) {
        // handle error
    })
    .on('end', function () {
        console.log("hey im done")
    });

    res.send("ante geia");
});

function checkIfExists(myObject) {
    PwPlusApisio.findOne({"secondObject":myObject}).then(docs => {
        if (docs) {
            console.log("im sorry for your existence")
        } else {
            add2(myObject)
        }
    });
    
}

function addTo(firstObject, secondObject) {
    const api = new PwPlusApisio({
        firstObject: firstObject,
        secondObject: secondObject
    });

    api // Κάνουμε save για να αποθηκευτεί στη βάση και μετά επιστρέφουμε κατάλληλο μήνυμα αν όλα πήγαν καλά και αντίστοιχα αν προέκυψε σφάλμα
        .save()
        .then(result => {

            console.log(result);

        })
        .catch(err => {
            console.log(err);

        });

}

function add(myObject) {
    const api = new PwPlusApisio({
        firstObject: myObject,
        secondObject: ""
    });

    api // Κάνουμε save για να αποθηκευτεί στη βάση και μετά επιστρέφουμε κατάλληλο μήνυμα αν όλα πήγαν καλά και αντίστοιχα αν προέκυψε σφάλμα
        .save()
        .then(result => {

            console.log(result);

        })
        .catch(err => {
            console.log(err);

        });

}

function add2(myObject) {
    const api = new PwPlusApisio({
        firstObject: "",
        secondObject: myObject
    });

    api // Κάνουμε save για να αποθηκευτεί στη βάση και μετά επιστρέφουμε κατάλληλο μήνυμα αν όλα πήγαν καλά και αντίστοιχα αν προέκυψε σφάλμα
        .save()
        .then(result => {

            console.log(result);

        })
        .catch(err => {
            console.log(err);

        });

}


module.exports = router;