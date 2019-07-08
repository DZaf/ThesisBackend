const express = require('express');
const router = express.Router();
const request = require('request');
const User = require('../mongo-models/user-model');


router.get('/', function (req, res, next) {
    res.send('respond Search');
});

router.get('/:email/', function (req, res, next) {
    if (req.params.email) {
        var email = req.params.email;
        if (req.query.tags) {
            if (req.query.tags instanceof Array) {
                var tags = req.query.tags;
            } else {
                var tags = [];
                tags.push(req.query.tags);
            }
            if (req.query.SSLSupport) {
                var SSLSupport=req.query.SSLSupport
            }
            else{
                var SSLSupport=""
            }

            // console.log(tags)
            getTagsFromArray(tags,SSLSupport).then((webApiUriArray) => {
                let uniqueOnlyResult = webApiUriArray.filter(onlyUnique);
                getApisFromArray(uniqueOnlyResult).then((webApis) => {
                    //---------- Εχουμε τα αποτελεσματα του search

                    findBestApi(email).then((user) => {
                        let arrayOfPrefferes = user[0].searched;
                        if (arrayOfPrefferes) {
                            addTagsToUser(user[0], tags).then((updatedUser) => {

                                var apiSort = [];


                                for (let i = 0; i < webApis.length; i++) {
                                    let tempApi = webApis[i];
                                    apiSort.push(
                                        {
                                            "api": tempApi,
                                            "big-counter": checkWebApisWithTags(tempApi, tags),
                                            "small-counter": checkWebApisWithSuggested(tempApi, updatedUser.searched)
                                        })
                                }
                                apiSort.sort(compareNumbers)





                                res.send(apiSort);
                            })

                        }
                    })
                })
            })
            //res.send("mpla");
        } else {
            res.status("400").send({ "code": "400", "message": "tags ara/is missing url must be at the format of /email/tags" })
        }
    } else {
        res.status("400").send({ "code": "400", "message": "email is missing url must be at the format of /email/tags" })
    }
});

async function getTagsFromArray(arrayOfTags,SSLSupport) {
    var combinedArray = [];
    var onlyValuesArray = [];
    for (let i = 0; i < arrayOfTags.length; i++) {
        let tempArray = await getData(arrayOfTags[i],SSLSupport)
        combinedArray = combinedArray.concat(tempArray);
    }
    for (let i = 0; i < combinedArray.length; i++) {
        onlyValuesArray.push(combinedArray[i].subject.value);
    }
    return onlyValuesArray;
}

async function getApisFromArray(arrayOfWebApis) {
    var combinedArray = [];
    var onlyValuesArray = [];
    for (let i = 0; i < arrayOfWebApis.length; i++) {
        let tempArray = await getDataFromWebApi(arrayOfWebApis[i])
        //console.log(tempArray);
        combinedArray.push(tempArray);
    }
    return combinedArray;
}

function getDataFromWebApi(webApiUri) {
    query = "select * where {<" + webApiUri + "> ?predicate ?object}";
    //console.log(query);
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                let myJson = {
                    hasTag: [],
                    hasCategory: [],
                    hasSupportedReqFormat: [],
                    hasSupportedResFormat: [],

                }
                for (let i = 0; i < JSON.parse(body).results.bindings.length; i++) {
                    let myElement = JSON.parse(body).results.bindings[i];
                    let myType = myElement.predicate.value.replace(/^.*#/g, '');
                    let myValue = myElement.object.value;
                    if (myType == "hasTag") {
                        myJson[myType].push(myValue);
                    } else if (myType == "hasCategory") {
                        myJson[myType].push(myValue);
                    }
                    else if (myType == "hasSupportedReqFormat") {
                        myJson[myType].push(myValue);
                    }
                    else if (myType == "hasSupportedResFormat") {
                        myJson[myType].push(myValue);
                    } else {
                        myJson[myType] = myValue;
                    }
                }
                // console.log(myJson);
                resolve(myJson);
            }
        })
    })
}



function getData(TagName,SSLSupport) {
    query = "select * where{<https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/" + TagName + "> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#assignedInApi> ?subject.";
    if(SSLSupport!="")
    {
        query= query+ "?subject <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#SSLSupport> 'true'." 
    }
    query= query+"}"
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(body).results.bindings);
            }
        })
    })
}


async function findBestApi(email) {
    let usersData = await getUsersPrefer(email);
    return usersData;
}

function getUsersPrefer(user_email) {
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job
        User
            .find({ email: user_email }) // will get all users
            .exec(function (err, user) {
                if (err) reject(err);
                if (user !== null) {
                    resolve(user);
                }

            });
    })
}

async function addTagsToUser(user, arrayOfTags) {
    var user = user;
    for (let i = 0; i < arrayOfTags.length; i++) {
        user = checkIfTagExists(user, arrayOfTags[i]);
    }
    return user;
}

function checkIfTagExists(user, tag) {
    var flag = true;
    if (user.searched) {
        // console.log(user);
        // console.log(user.searched.length);
        for (let i = 0; i < user.searched.length; i++) {
            if (user.searched[i].tag == tag) {
                user.searched[i].times = user.searched[i].times + 1
                let times = user.searched[i].times;
                addPrefferToUser(user, tag, times);
                flag = false;
            }
        }
        if (flag) {

            // console.log(flag);
            addNewPrefferToUser(user, { "tag": tag, "times": 1 });
            user.searched.push({ "tag": tag, "times": 1 });

        }
    }
    return user;
}

function addNewPrefferToUser(user, newTagObject) {
    console.log("nai egw egine")
    // Return new promise 
    return new Promise(function (resolve, reject) {
        //console.log(user.searched)
        // Do async job
        User.updateOne(
            { email: user.email },
            { $push: { searched: newTagObject } },

        ).then((result) => {
            console.log(newTagObject);
        });
        resolve(user);
    })
}


function addPrefferToUser(user, tag, times) {
    // Return new promise 
    return new Promise(function (resolve, reject) {
        //console.log(user.searched)
        // Do async job
        User.updateOne(
            {
                email: user.email,
                searched: { $elemMatch: { tag: tag } }
            },
            { $set: { "searched.$.times": times } },

        ).then((result) => {
            console.log(times);
        });
        resolve(user);
    })
}

function checkWebApisWithTags(webApi, tags) {
    var counter = 0;
    var filteredTagUri;
    for (let i = 0; i < webApi.hasTag.length; i++) {
        filteredTagUri = webApi.hasTag[i].replace(/^.*\//g, '');
        for (let j = 0; j < tags.length; j++) {
            if (tags[j] == filteredTagUri) {
                counter = counter + 1;
            }
        }
    }
    return counter;
}

function checkWebApisWithSuggested(webApi, suggested) {
    var counter = 0;
    var filteredTagUri;
    for (let i = 0; i < webApi.hasTag.length; i++) {
        filteredTagUri = webApi.hasTag[i].replace(/^.*\//g, '');
        for (let j = 0; j < suggested.length; j++) {
            if (suggested[j].tag == filteredTagUri) {
                counter = counter + suggested[j].times;
            }
        }
    }
    return counter;
}

function compareNumbers(a, b) {
    if (b["big-counter"] > a["big-counter"]) {
        return 1;
    } else if (b["big-counter"] < a["big-counter"]) {
        return -1;
    } else {
        if (b["small-counter"] > a["small-counter"]) {
            return 1;
        } else if (b["small-counter"] < a["small-counter"]) {
            return -1;
        }
    }
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}


module.exports = router;