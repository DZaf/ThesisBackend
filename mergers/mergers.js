var express = require('express');
const mongoose = require("mongoose");
const pw = require('../mongo-models/pw-model.js')
const apisio = require('../mongo-models/apis-model')
const apiguru = require('../mongo-models/apiguru-model')
const PwPlusApisio = require('../mongo-models/pwPlusApisio-model')
const Apidb = require('../mongo-models/apidb-model')
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

                if (pwApiEndpoint.match(/\w+\.\w+/g)) {
                    pwApiEndpoint = pwApiEndpoint.replace(/(.*h?ttps?:.*\/\/)/g, '');
                    pwApiEndpoint = pwApiEndpoint.replace(/\/[\W?\w?]*$/g, '');
                    pwApiEndpoint = pwApiEndpoint.replace(/^\/api\//g, '');
                    pwApiEndpoint = pwApiEndpoint.replace(/wss:\/\//g, '');
                    if (pwApiEndpoint != "") {
                        apisio.find({ "apisioAPI.baseURL": { $regex: '.*' + pwApiEndpoint + '.*' } }, function (err, result) {
                            if (err) throw err;
                            if (result.length > 0) {
                                //addTo(doc, result[0]);
                                console.log(result[0].apisioAPI.baseURL + " = " + pwApiEndpoint);
                            }
                            else {
                                //add(doc);
                                //console.log("-------------" + pwApiEndpoint);
                            }

                        });
                    }
                }
            } else {
                var pwApiHomePage = doc.pwAPI["API Portal / Home Page"];
                apisio.find({ "apisioAPI.humanURL": pwApiHomePage }, function (err, result) {
                    if (err) throw err;
                    if (result.length > 0) {
                        //addTo(doc, result[0]);
                        console.log(result[0].apisioAPI.humanURL + " = " + pwApiHomePage);
                    }
                    else {
                        //add(doc);
                        //console.log("====================" + pwApiHomePage);
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
                else {
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

router.get('/addall/pw', function (req, res, next) {

    pw.find({}).stream()
        .on('data', function (doc) {
            checkIfPwExists(doc)
        })
        .on('error', function (err) {
            // handle error
        })
        .on('end', function () {
            console.log("hey im done")
        });

    res.send("ante geia");
});


router.get('/add/pw', function (req, res, next) {

    PwPlusApisio.find({}).stream()
        .on('data', function (doc) {
            if (doc.secondObject._id && doc.firstObject._id) {
                apisioObject = doc.secondObject;
                if (apisioObject.apisioAPI.baseURL || apisioObject.apisioAPI.machineURL) {
                    if (apisioObject.apisioAPI.baseURL) {
                        humanUrl = apisioObject.apisioAPI.baseURL;
                    }
                    else {
                        humanUrl = apisioObject.apisioAPI.machineURL;
                    }

                    humanUrl = humanUrl.replace(/(.*h?ttps?:.*\/\/)/g, '');
                    // humanUrl = humanUrl.replace(/\/[\W?\w?]*$/g, '');
                    // console.log("i am a human url  " + humanUrl);

                    pw.find({ "pwAPI.API Endpoint": { $regex: '.*' + humanUrl + '.*' } }, function (err, result) {
                        if (err) throw err;
                        if (result.length > 0) {
                            // console.log("##########################################################################");
                            // console.log(doc._id);
                            // console.log(doc);
                            // console.log("----------- = " + result[0].pwAPI["API Endpoint"]);
                            addNewPwObject(doc._id, result[0]);
                            console.log("##########################################################################");
                        }
                        // else {
                        //     // console.log("################"+humanUrl+" doesnt exist on pw database");
                        //     // checkIfPwExists(result[0]);
                        // }

                    });

                }
            } else {
                if (doc.firstObject._id) {
                    apiGuruObject = doc.firstObject;
                    var version = apiGuruObject.apiguru["preferred"];
                    var url = apiGuruObject.apiguru.versions[version].info["x-providerName"];
                    //console.log("i am an X provider  " + url);

                    pw.find({ "pwAPI.API Portal / Home Page": { $regex: '.*' + url + '.*' } }, function (err, result) {
                        if (err) throw err;
                        if (result.length > 0) {
                            // console.log("##########################################################################");
                            // console.log(doc._id);
                            // console.log(doc);
                            // console.log("!!!!!!!!!!!!!" + url + " = " + result[0].pwAPI["API Portal / Home Page"]);
                            addNewPwObject(doc._id, result[0]);
                            console.log("##########################################################################");
                        }
                        else {
                            pw.find({ "pwAPI.API Endpoint": { $regex: '.*' + url + '.*' } }, function (err, result1) {
                                if (err) throw err;
                                if (result1.length > 0) {
                                    // console.log("##########################################################################");
                                    // console.log(doc._id);
                                    // console.log(doc);
                                    // console.log("!!!!!!!!!!!!! = " + result1[0].pwAPI["API Endpoint"]);
                                    addNewPwObject(doc._id, result1[0]);
                                    console.log("##########################################################################");
                                }
                                // else {
                                //     // console.log("################"+url+" doesnt exist on pw database");
                                //     checkIfPwExists(result1[0]);
                                // }

                            });
                        }

                    });

                }
                if (doc.secondObject._id) {
                    apisioObject = doc.secondObject;
                    if (apisioObject.apisioAPI.baseURL || apisioObject.apisioAPI.machineURL) {
                        if (apisioObject.apisioAPI.baseURL) {
                            humanUrl = apisioObject.apisioAPI.baseURL;
                        }
                        else {
                            humanUrl = apisioObject.apisioAPI.machineURL;
                        }

                        humanUrl = humanUrl.replace(/(.*h?ttps?:.*\/\/)/g, '');
                        // humanUrl = humanUrl.replace(/\/[\W?\w?]*$/g, '');
                        // console.log("i am a human url  " + humanUrl);

                        pw.find({ "pwAPI.API Endpoint": { $regex: '.*' + humanUrl + '.*' } }, function (err, result) {
                            if (err) throw err;
                            if (result.length > 0) {
                                // console.log("##########################################################################");
                                // console.log(doc._id);
                                // console.log(doc);
                                // console.log("----------- = " + result[0].pwAPI["API Endpoint"]);
                                addNewPwObject(doc._id, result[0]);
                                console.log("##########################################################################");
                            }
                            // else {
                            //     // console.log("################"+humanUrl+" doesnt exist on pw database");
                            //     checkIfPwExists(result[0]);
                            // }

                        });

                    }
                }
            }

        })
        .on('error', function (err) {
            // handle error
        })
        .on('end', function () {
            // final callback
        });

    res.send("ok kai ante geia mazi");
});

function checkIfExists(myObject) {
    PwPlusApisio.findOne({ "secondObject": myObject }).then(docs => {
        if (docs) {
            console.log("im sorry for your existence")
        } else {
            add2(myObject)
        }
    });

}

function checkIfPwExists(myObject) {
    console.log("--------------------------------------------------------------------------");
    console.log(myObject);
    console.log("--------------------------------------------------------------------------");
    PwPlusApisio.findOne({ "thirdObject": myObject }).then(docs => {
        if (docs) {
            //console.log(docs);
            console.log("im sorry for your existence mister pw")
        } else {

            addPw(myObject)
        }
    });

}

function addTo(firstObject, secondObject) {
    const api = new PwPlusApisio({
        firstObject: firstObject,
        secondObject: secondObject,
        thirdObject: ""
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
        secondObject: "",
        thirdObject: ""
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
        secondObject: myObject,
        thirdObject: ""
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

function addPw(myObject) {
    const api = new PwPlusApisio({
        firstObject: "",
        secondObject: "",
        thirdObject: myObject
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


function addNewPwObject(id, myObject) {
    // console.log("--------------------------------------------------------------------------");
    // console.log(id);
    // console.log("--------------------------------------------------------------------------");
    PwPlusApisio.updateOne(
        { _id: id },
        { thirdObject: myObject }, function (err, affected) {
            if (err) throw err
            if (affected) { console.log(affected) }
        }

    );
}


router.get('/findElements/apiguru', function (req, res, next) {

    PwPlusApisio.find({ "firstObject.apiguru": { $exists: true } }).stream()
        .on('data', function (doc) {
            var version = doc.firstObject.apiguru["preferred"];
            //console.log(doc)
            var apiguruObject = doc.firstObject.apiguru.versions[version]
            var apiguruInfo = apiguruObject.info
            var json = {
                "createdAt": doesExist(apiguruObject.added),
                "name": doesExist(apiguruInfo.title),
                "description": doesExist(apiguruInfo.description),
                "imageUrl": doesExist(doesExist(apiguruInfo["x-logo"]).url),
                "homePage": doesExist(apiguruInfo["x-providerName"]),
                "endpoint": "",
                "tags": "",
                "swaggerUrl": doesExist(apiguruInfo.swaggerUrl),
                "slug": "",
                "updatedAt": doesExist(apiguruInfo.updated),
                "licenseUrl": doesExist(doesExist(apiguruInfo.license).url),
                "category": doesExist(apiguruInfo["x-apisguru-categories"]),
                "provider": doesExist(apiguruInfo["x-providerName"]),
                "SSLSuport": "",
                "autheticationModel": "",
                "termsOfServiceUrl": doesExist(apiguruInfo.termsOfService),
                "architecturalModel": "",
                "supportedResponseFormats": "",
                "supportedRequestFormats": "",
                "documentationUrl": doesExist(doesExist(apiguruInfo.externalDocs).url)
            }
            console.log(json)


        })
        .on('error', function (err) {
            // handle error
        })
        .on('end', function () {
            console.log("hey im done")
        });

    res.send("ante geia");
});

router.get('/findElements/pw', function (req, res, next) {

    PwPlusApisio.find({ "thirdObject.pwAPI": { $exists: true } }).stream()
        .on('data', function (doc) {
            var pwObject = doc.thirdObject.pwAPI
            var category = []
            if (pwObject["Primary Category"]) {
                category.push(pwObject["Primary Category"].replace(/\/category\//g, ''))
            }
            if (pwObject["Secondary Categories"]) {
                category.push(pwObject["Secondary Categories"].replace(/\/category\//g, ''))
            }
            if (category.length == 0) {
                category = ""
            }

            var json = {
                "createdAt": "",
                "name": doesExist(pwObject["API Title"]),
                "description": doesExist(pwObject["API Description"]),
                "imageUrl": "",
                "homePage": doesExist(pwObject["API Portal / Home Page"]),
                "endpoint": doesExist(pwObject["API Endpoint"]),
                "tags": "",
                "swaggerUrl": "",
                "slug": "",
                "updatedAt": "",
                "licenseUrl": "",
                "category": category,
                "provider": doesExist(pwObject["API Provider"]),
                "SSLSuport": doesExist(pwObject["SSL Suport"]),
                "autheticationModel": doesExist(pwObject["Authentication Model"]),
                "termsOfServiceUrl": doesExist(pwObject["Terms Of Service URL"]),
                "architecturalModel": doesExist(pwObject["Architectural Style"]),
                "supportedResponseFormats": doesExist(pwObject["Supported Response Formats"]),
                "supportedRequestFormats": doesExist(pwObject["Supported Request Formats"]),
                "documentationUrl": doesExist(pwObject["Docs Home Page URL"])
            }
            console.log(json)
            


        })
        .on('error', function (err) {
            // handle error
        })
        .on('end', function () {
            console.log("hey im done pw")
        });

    res.send("ante geia pw");
});

router.get('/findElements/apisio', function (req, res, next) {

    PwPlusApisio.find({ "secondObject.apisioAPI": { $exists: true } }).stream()
        .on('data', function (doc) {
            //console.log(doc)
            var apisioObject = doc.secondObject.apisioAPI
            var endpoint = "";
            if (apisioObject.baseURL) {
                endpoint = apisioObject.baseURL;
            }
            if (apisioObject.machineURL) {
                endpoint = apisioObject.machineURL;
            }
            var json = {
                "createdAt": doesExist(apisioObject.createdAt),
                "name": doesExist(apisioObject.name),
                "description": doesExist(apisioObject.description),
                "imageUrl": doesExist(apisioObject.image),
                "homePage": doesExist(apisioObject.humanURL),
                "endpoint": endpoint,
                "tags": doesExist(apisioObject.tags),
                "swaggerUrl": "",
                "slug": doesExist(apisioObject.slug),
                "updatedAt": doesExist(apisioObject.updatedAt),
                "licenseUrl": "",
                "category": "",
                "provider": "",
                "SSLSuport": "",
                "autheticationModel": "",
                "termsOfServiceUrl": "",
                "architecturalModel": "",
                "supportedRequestFormats": "",
                "supportedResponseFormats": "",
                "documentationUrl": ""
            }
            console.log(json)


        })
        .on('error', function (err) {
            // handle error
        })
        .on('end', function () {
            console.log("hey im done")
        });

    res.send("ante geia");
});

router.get('/findElements', function (req, res, next) {

    PwPlusApisio.find({}).stream()
        .on('data', function (doc) {
            var apiguruObject = {};
            var apisioObject = {};
            var pwObject = {};
            var apiguruInfo={};
            var category = []
            if (doc.firstObject.apiguru) {
                var version = doc.firstObject.apiguru["preferred"];
                apiguruObject = doc.firstObject.apiguru.versions[version]
                apiguruInfo = apiguruObject.info
                category=doesExist(apiguruInfo["x-apisguru-categories"]);

            }
            var endpoint=''
            if(doc.secondObject.apisioAPI)
            {
                apisioObject = doc.secondObject.apisioAPI
                if (apisioObject.baseURL) {
                    endpoint = apisioObject.baseURL;
                }
                if (apisioObject.machineURL) {
                    endpoint = apisioObject.machineURL;
                }
            }
            if(doc.thirdObject.pwAPI)
            {
                pwObject = doc.thirdObject.pwAPI
                if (pwObject["Primary Category"]) {
                    category.push(pwObject["Primary Category"].replace(/\/category\//g, ''))
                }
                if (pwObject["Secondary Categories"]) {
                    category.push(pwObject["Secondary Categories"].replace(/\/category\//g, ''))
                }
                if (category.length == 0) {
                    category = ""
                }
            }
            var categories= "";
            if(category.length>0)
            {
                categories= category.filter(onlyUnique);
            }
           
            
           
            


            var json={
                "createdAt":chooseOne(doesExist(doesExist(apiguruObject).added),doesExist(doesExist(apisioObject).createdAt),"") ,
                "name": chooseOne(doesExist(apiguruInfo.title),doesExist(doesExist(apisioObject).name),doesExist(pwObject["API Title"])) ,
                "description": chooseOne(doesExist(apiguruInfo.description),doesExist(doesExist(apisioObject).description),doesExist(pwObject["API Description"])) ,
                "imageUrl": chooseOne(doesExist(doesExist(apiguruInfo["x-logo"]).url),doesExist(doesExist(apisioObject).image),"") ,
                "homePage": chooseOne(doesExist(apiguruInfo["x-providerName"]),doesExist(doesExist(apisioObject).humanURL),doesExist(pwObject["API Portal / Home Page"]))  ,
                "endpoint": chooseOne("",endpoint,doesExist(pwObject["API Endpoint"])),
                "tags": doesExist(apisioObject.tags),
                "swaggerUrl": chooseOne(doesExist(apiguruInfo.swaggerUrl),"","") ,
                "slug": chooseOne("",doesExist(doesExist(apisioObject).slug),"") ,
                "updatedAt": chooseOne(doesExist(apiguruInfo.updated),doesExist(doesExist(apisioObject).updatedAt),"") ,
                "licenseUrl": chooseOne(doesExist(doesExist(apiguruInfo.license).url),"","") ,
                "category": categories ,
                "provider": chooseOne(doesExist(apiguruInfo["x-providerName"]),"",doesExist(pwObject["API Provider"]).replace(/\/company\//g, '')) ,
                "SSLSuport": chooseOne("","",doesExist(pwObject["SSL Suport"])) ,
                "autheticationModel":chooseOne("","",doesExist(pwObject["Authentication Model"])) ,
                "termsOfServiceUrl": chooseOne(doesExist(apiguruInfo.termsOfService),"",doesExist(pwObject["Terms Of Service URL"])) ,
                "architecturalModel": chooseOne("","",doesExist(pwObject["Architectural Style"])) ,
                "supportedRequestFormats":chooseOne("","",doesExist(pwObject["Supported Response Formats"])),
                "supportedResponseFormats": chooseOne("","",doesExist(pwObject["Supported Request Formats"])) ,
                "documentationUrl": chooseOne(doesExist(doesExist(apiguruInfo.externalDocs).url),"",doesExist(pwObject["Docs Home Page URL"])) 
                 }
                 //console.log(json);

                 const api = new Apidb({
                    api:json
                });
    
                api // Κάνουμε save για να αποθηκευτεί στη βάση και μετά επιστρέφουμε κατάλληλο μήνυμα αν όλα πήγαν καλά και αντίστοιχα αν προέκυψε σφάλμα
                    .save()
                    .then(result => {
    
                        console.log(result);
    
                    })
                    .catch(err => {
                        console.log(err);
    
                    });

        })
        .on('error', function (err) {
            // handle error
        })
        .on('end', function () {
            console.log("hey im done")
        });

    res.send("ante geia");
});



function chooseOne(apiguru, apisio, pw) {
    if (apiguru != '') {
        return apiguru;
    }
    else if (apisio != '') {
        return apisio;
    }
    else if (pw != '') {
        return pw;
    }
    return '';
}

function doesExist(element) {
    if (element) {
        return element;
    }
    return '';
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}


module.exports = router;