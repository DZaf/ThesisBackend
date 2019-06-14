const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Apidb = require('../mongo-models/apidb-model')
const fs = require('fs');
const stream = fs.createWriteStream("./owl/triples.ttl", { flags: 'a' });
const request = require('request');


mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
});

router.get('/', (req, res) => {
    fs.readFile('owl/owl.owl', (err, data) => {
        if (err) {
            throw err;
        }

        res.send("<html><head></head><body><body><pre style='word-wrap: break-word; white-space: pre-wrap;'>" + data + "</pre></html>")
    });
});

router.get('/webAPI', (req, res) => {


    Apidb.find({}).stream()
        .on('data', function (doc) {
            let fname = doc.api.name.replace(/ /g, '-');
            let item = doc.api;

            check("webAPIs/" + fname, 'created_at', '"' + item.createdAt + '"');
            check("webAPIs/" + fname, 'name', '"' + item.name + '"');
            check("webAPIs/" + fname, 'description', '"' + item.description.replace(/\r/g, "").replace(/\n/g, "").replace(/"/g, "'").replace(/\#/g, "").replace(/\\/g, "") + '"');
            check("webAPIs/" + fname, 'image', '"' + item.imageUrl + '"');
            check("webAPIs/" + fname, 'homepage', '"' + item.homePage + '"');

            check("webAPIs/" + fname, 'endpoint', '"' + item.endpoint + '"');
            check("webAPIs/" + fname, 'swagger_url', '"' + item.swaggerUrl + '"');
            check("webAPIs/" + fname, 'slug', '"' + item.slug + '"');
            check("webAPIs/" + fname, 'update_at', '"' + item.updatedAt + '"');
            check("webAPIs/" + fname, 'license_url', '"' + item.licenseUrl + '"');
            check("webAPIs/" + fname, 'type', "<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#WebAPI>");

            if (item.SSLSupport == "Yes") {
                check("webAPIs/" + fname, 'SSLSupport', '"' + true + '"');
            } else if (item.SSLSupport == "No") {
                check("webAPIs/" + fname, 'SSLSupport', '"' + false + '"');
            }

            check("webAPIs/" + fname, 'auth_model', '"' + item.autheticationModel + '"');
            check("webAPIs/" + fname, 'terms_of_service', '"' + item.termsOfServiceUrl + '"');
            check("webAPIs/" + fname, 'doc_url', '"' + item.documentationUrl + '"');



            if (item.tags != "") {
                if (item.tags instanceof Array) {
                    var flag = false;
                    let res = item.tags.map(function (x) {
                        if (x.indexOf(',') > -1) {
                            let splited = x.split(",")
                            flag = true;
                            return splited
                        } else {
                            flag = false;
                            return x;
                        }
                    })
                    if (flag) {
                        res[0].map(function (x) {
                            let fitem = x.replace(/^ /g, '')
                            fitem = fitem.replace(/ /g, '-').toLowerCase();
                            check("webAPIs/" + fname, 'hasTag', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/' + fitem + '> ');
                            check("tags/" + fitem, 'assignedInApi', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                            // console.log(fitem)
                        })
                    } else {
                        item.tags.map(function (x) {
                            let fitem = x.replace(/^ /g, '')
                            fitem = fitem.replace(/ /g, '-').toLowerCase();
                            check("webAPIs/" + fname, 'hasTag', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/' + fitem + '> ');
                            check("tags/" + fitem, 'assignedInApi', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                            // console.log(fitem)
                        })
                    }
                } else {
                    let res = item.tags.split(",");
                    res.map(function (x) {
                        let fitem = x.replace(/^ /g, '')
                        fitem = fitem.replace(/ /g, '-').toLowerCase();
                        check("webAPIs/" + fname, 'hasTag', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/' + fitem + '> ');
                        check("tags/" + fitem, 'assignedInApi', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                        // console.log(fitem)
                    })
                }

            }

            if (item.category != "") {
                item.category.map(function (x) {
                    let fitem = x.replace(/ /g, '-').toLowerCase();
                    check("webAPIs/" + fname, 'hasCategory', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/categories/' + fitem + '> ');
                    check("categories/" + fitem, 'isCategoryOf', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                    // console.log(fitem)
                })
            }

            if (item.provider != "") {
                let fitem = item.provider.replace(/ /g, '-').toLowerCase();
                check("webAPIs/" + fname, 'hasProvider', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/providers/' + fitem + '> ');
                check("providers/" + fitem, 'isProviderOf', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                // console.log(fitem)

            }

            if (item.architecturalModel != "") {
                let fitem = item.architecturalModel.replace(/ /g, '-').toLowerCase();
                check("webAPIs/" + fname, 'hasProtocol', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/protocols/' + fitem + '> ');
                check("protocols/" + fitem, 'isProtocolOf', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                // console.log(fitem)

            }


            if (item.supportedRequestFormats != "") {
                let res = doc.api.supportedRequestFormats.split(", ");
                res.map(function (x) {
                    let fitem = x.replace(/^ /g, '')
                    fitem = fitem.replace(/ /g, '-').toLowerCase();
                    check("webAPIs/" + fname, 'hasSupportedReqFormat', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/dataReqFormats/' + fitem + '> ');
                    check("dataReqFormats/" + fitem, 'isSupportedReqFormatOf', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                    // console.log(fitem)
                })
            }


            if (item.supportedResponseFormats != "") {
                let res = doc.api.supportedResponseFormats.split(", ");
                res.map(function (x) {
                    let fitem = x.replace(/^ /g, '')
                    fitem = fitem.replace(/ /g, '-').toLowerCase();
                    check("webAPIs/" + fname, 'hasSupportedResFormat', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/dataResFormats/' + fitem + '> ');
                    check("dataResFormats/" + fitem, 'isSupportedResFormatOf', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                    // console.log(fitem)
                })
            }


        })
        .on('error', function (err) {
            // handle error
        })
        .on('end', function () {
            console.log("hey im done")
            //stream.end();
        });

    res.send("i am an ontology WEBAPI");
});


router.get('/turtleFirstAdd', (req, res) => {

    var tags = [];
    var categories = [];
    var providers = [];
    var protocols = [];
    var dataReqFormat = [];
    var dataResFormat = [];

    //-----------distinct-----------------
    var distTags = [];
    var distCategories = [];
    var distProviders = [];
    var distProtocols = [];
    var distDataReqFormat = [];
    var distDataResFormat = [];

    Apidb.find({})
        .stream()
        .on('data', function (doc) {



            if (doc.api.tags != "") {
                if (doc.api.tags instanceof Array) {
                    var flag = false;
                    let res = doc.api.tags.map(function (x) {
                        if (x.indexOf(',') > -1) {
                            let splited = x.split(",")
                            flag = true;
                            return splited
                        } else {
                            flag = false;
                            return x;
                        }
                    })
                    if (flag) {
                        res[0].map(function (x) {
                            tags.push(x)
                        })
                    } else {
                        tags = tags.concat(doc.api.tags);
                    }
                } else {
                    let res = doc.api.tags.split(",");
                    tags = tags.concat(res);
                }

            }

            if (doc.api.category != "") {
                categories = categories.concat(doc.api.category);
            }

            if (doc.api.provider != "") {
                providers.push(doc.api.provider);
            }

            if (doc.api.architecturalModel != "") {
                protocols.push(doc.api.architecturalModel);
            }


            if (doc.api.supportedRequestFormats != "") {

                let res = doc.api.supportedRequestFormats.split(", ");
                dataReqFormat = dataReqFormat.concat(res);
            }

            if (doc.api.supportedResponseFormats != "") {
                let res = doc.api.supportedResponseFormats.split(", ");
                dataResFormat = dataResFormat.concat(res);
            }


        })
        .on('error', function (err) {
            // handle error
        })
        .on('end', function () {
            tags = tags.map(function (x) {
                return String(x).toLowerCase().replace(/^ /g, '').replace(/ /g, '-')
            })
            categories = categories.map(function (x) {
                return x.toLowerCase().replace(/ /g, '-')
            })
            providers = providers.map(function (x) {
                return x.toLowerCase().replace(/ /g, '-')
            })
            protocols = protocols.map(function (x) {
                return x.toLowerCase().replace(/ /g, '-')
            })
            dataReqFormat = dataReqFormat.map(function (x) {
                return x.toLowerCase().replace(/ /g, '-')
            })
            dataResFormat = dataResFormat.map(function (x) {
                return x.toLowerCase().replace(/ /g, '-')
            })

            distTags = tags.filter(onlyUnique);
            distCategories = categories.filter(onlyUnique);
            distProviders = providers.filter(onlyUnique);
            distProtocols = protocols.filter(onlyUnique);
            distDataReqFormat = dataReqFormat.filter(onlyUnique);
            distDataResFormat = dataResFormat.filter(onlyUnique);

            distTags.forEach(function (item) {
                let fitem = item.replace(/-/g, ' ');
                addTtl("tags/" + item, 'title', '"' + fitem + '"');
                addTtl("tags/" + item, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Tags>');

            });

            distCategories.forEach(function (item) {
                let fitem = item.replace(/-/g, ' ');

                addTtl("categories/" + item, 'title', '"' + fitem + '"');
                addTtl("categories/" + item, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Category>');

            });

            distProviders.forEach(function (item) {
                let fitem = item.replace(/-/g, ' ');

                addTtl("providers/" + item, 'title', '"' + fitem + '"');
                addTtl("providers/" + item, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Provider>');

            });

            distProtocols.forEach(function (item) {
                let fitem = item.replace(/-/g, ' ');

                addTtl("protocols/" + item, 'title', '"' + fitem + '"');
                addTtl("protocols/" + item, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Protocols>');

            });

            distDataReqFormat.forEach(function (item) {
                let fitem = item.replace(/-/g, ' ');

                addTtl("dataReqFormats/" + item, 'title', '"' + fitem + '"');
                addTtl("dataReqFormats/" + item, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#DataRequestFormat>');

            });

            distDataResFormat.forEach(function (item) {
                let fitem = item.replace(/-/g, ' ');

                addTtl("dataResFormats/" + item, 'title', '"' + fitem + '"');
                addTtl("dataResFormats/" + item, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#DataResponseFormat>');

            });

        });


    res.send("i am an ontology");
});

router.get('/ApiTagger', (req, res) => {
    var arrayOfNameTags = [];
    var arrayOfNameTagsUnique = [];
    Apidb.find({}).stream()
        .on('data', function (doc) {
            let fname = doc.api.name.replace(/ /g, '-');
            let newArray = []
            let arrayOfSplitedName = fname.split("-").filter(e => (e !== '' && e !== '/' && e !== '&'));
            arrayOfSplitedName.map(function (x) {
                x = x.split(/(?=[A-Z][a-z]+)/);
                newArray = newArray.concat(x)
                return x;
            })
            newArray = newArray.map(function (x) {
                return x.toLowerCase().replace(/\)/g, '').replace(/\(/g, '').replace(/\//g, '').replace(/\,/g, '').replace(/^.?.$/g, '');
            })
            newArray = newArray.filter(onlyUnique).filter(e => (e != ''));
            // console.log(newArray)
            newArray.forEach(function (string) {
                query = "select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/" + string + "> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?object}"
                request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {
                    if (body) {
                        if (JSON.parse(body).results.bindings.length != 0) {
                            query2 = "select ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/" + fname + "> ?object <https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/" + string + "> }"
                            request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query2, "output": "json" } }, function (err2, response2, body2) {
                                if (body2) {
                                    if (JSON.parse(body2).results.bindings.length == 0) {

                                        check("webAPIs/" + fname, 'hasTag', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/' + string + '> ');
                                        check("tags/" + string, 'assignedInApi', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                                        // console.log(query2);
                                    }
                                }
                            })

                        }
                    } else {

                    }
                })


                // 
                //     check("webAPIs/" + fname, 'hasTag', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/' + string + '> ');
                //     check("tags/" + string, 'assignedInApi', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                //     //console.log(stringTag+" den uparxei");
                // 

            })

            arrayOfNameTags = arrayOfNameTags.concat(arrayOfSplitedName)


            // console.log(arrayOfNameTags)
            // console.log(arrayOfSplitedName);
        }).on('error', function (err) {
            // handle error
        })
        .on('end', function () {
            arrayOfNameTags = arrayOfNameTags.filter(onlyUnique);
            arrayOfNameTags.map(function (x) {
                x = x.split(/(?=[A-Z][a-z]+)/);
                arrayOfNameTagsUnique = arrayOfNameTagsUnique.concat(x)
                return x;
            })
            arrayOfNameTagsUnique = arrayOfNameTagsUnique.map(function (x) {
                return x.toLowerCase()
            })
            arrayOfNameTagsUnique = arrayOfNameTagsUnique.filter(onlyUnique);
            var counter = 0;
            arrayOfNameTagsUnique.forEach(function (stringTag) {
                stringTag = stringTag.replace(/\)/g, '').replace(/\(/g, '').replace(/\//g, '').replace(/\,/g, '').replace(/^.?.$/g, '')
                if (stringTag != "") {
                    query = "select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/" + stringTag + "> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?object}"
                    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {
                        if (body) {
                            if (JSON.parse(body).results.bindings.length == 0) {
                                addTtl("tags/" + stringTag, 'title', '"' + stringTag + '"');
                                addTtl("tags/" + stringTag, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Tags>');
                                //console.log(stringTag+" den uparxei");
                            }
                        }
                    })

                }
            })





            //console.log(arrayOfNameTagsUnique)
            console.log("hey im done")

            //stream.end();
        });
    res.send("finished");


});

router.get('/ApiCategory', (req, res) => {
    checkForCategoriesToTags();

    res.send("finished");

});

async function checkIfTagExistsAlready(value1, fname) {

    query3 = "select * where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/" + value1 + "> ?subject <https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/" + fname + ">}"
    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query3, "output": "json" } }, function (err3, response3, body3) {
        if (body3) {
            if (JSON.parse(body3).results.bindings.length == 0) {
                check("webAPIs/" + fname, 'hasTag', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/' + value1 + '> ');
                check("tags/" + value1, 'assignedInApi', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
            }
        }
    })
}

const checkIfCategoryExistsUsATag = async function (value, fname) {
    return new Promise((resolve, reject) => {
        query2 = "select * where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/" + value + "> ?subject <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Tags>}"
        request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query2, "output": "json" } }, function (err2, response2, body2) {
            if (body2) {
                if (JSON.parse(body2).results.bindings.length == 0) {
                    addTtl("tags/" + value, 'title', '"' + value.replace(/-/g, ' ') + '"');
                    addTtl("tags/" + value, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Tags>');
                    check("webAPIs/" + fname, 'hasTag', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/' + value + '> ');
                    check("tags/" + value, 'assignedInApi', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                    resolve();
                }
                else {
                    checkIfTagExistsAlready(value, fname).then(resolve());

                }
            }
        })
    });

}

async function checkForCategoriesToTags() {

    query = "select * where{ ?subject <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#hasCategory> ?object}"
    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {


        for (let i = 0; i < JSON.parse(body).results.bindings.length; i++) {
            let myObject = JSON.parse(body).results.bindings[i]
            var value = myObject.object.value.replace(/^.*\//g, '').replace(/\>$/g, '');
            let fname = myObject.subject.value.replace(/^.*\//g, '').replace(/\>$/g, '');
            checkIfCategoryExistsUsATag(value, fname)
        }


    })

}


function addTtl(one, two, three) {

    one = '<https://thesis-server-icsd14052-54.herokuapp.com/ns/' + one + '> ';

    if (two == "type") {

        two = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#' + two + '> ';
    } else {
        two = '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#' + two + '> ';
    }


    three = three + " . \n";


    stream.write(one + two + three);
    // fs.appendFile('./owl/triples.ttl', one + two + three, function (err) {
    //     if (err) throw err;
    // });

}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function check(one, two, value) {
    if (value != '""') {
        addTtl(one, two, value);
    }
}



module.exports = router;