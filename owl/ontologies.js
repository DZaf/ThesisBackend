const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Apidb = require('../mongo-models/apidb-model')
const fs = require('fs');


mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
});

router.get('/', (req, res) => {
    res.send("i am an ontology");
});

router.get('/webAPI', (req, res) => {
    Apidb.find({}).stream()
        .on('data', function (doc) {
            let fname = doc.api.name.replace(/ /g, '-');
            let item = doc.api;


            check("webAPIs/"+fname, 'created_at', '"' + item.createdAt + '"');            
            check("webAPIs/"+fname, 'name', '"' + item.name + '"');
            check("webAPIs/"+fname, 'description', '"' + item.description.replace(/"/g, "'") + '"');
            check("webAPIs/"+fname, 'image', '"' + item.imageUrl + '"');
            check("webAPIs/"+fname, 'homepage', '"' + item.homePage + '"');

            check("webAPIs/"+fname, 'endpoint', '"' + item.endpoint + '"');
            check("webAPIs/"+fname, 'swagger_url', '"' + item.swaggerUrl + '"');
            check("webAPIs/"+fname, 'slug', '"' + item.slug + '"');
            check("webAPIs/"+fname, 'update_at', '"' + item.updatedAt + '"');
            check("webAPIs/"+fname, 'license_url', '"' + item.licenseUrl + '"');

            if(item.SSLSupport=="Yes")
            {
                check("webAPIs/"+fname, 'SSLSupport', '"' + true + '"');
            }else if(item.SSLSupport=="No")
            {
                check("webAPIs/"+fname, 'SSLSupport', '"' + false + '"');
            }

            check("webAPIs/"+fname, 'auth_model', '"' + item.autheticationModel + '"');
            check("webAPIs/"+fname, 'terms_of_service', '"' + item.termsOfServiceUrl + '"');
            check("webAPIs/"+fname, 'doc_url', '"' + item.documentationUrl + '"');



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
                            fitem = fitem.replace(/ /g, '-');
                            check("webAPIs/" + fname, 'hasTag', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/' + fitem + '> ');
                            check("tags/" + fitem, 'assignedInApi', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                            // console.log(fitem)
                        })
                    } else {
                        item.tags.map(function (x) {
                            let fitem = x.replace(/^ /g, '')
                            fitem = fitem.replace(/ /g, '-');
                            check("webAPIs/" + fname, 'hasTag', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/' + fitem + '> ');
                            check("tags/" + fitem, 'assignedInApi', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                            // console.log(fitem)
                        })
                    }
                } else {
                    let res = item.tags.split(",");
                    res.map(function (x) {
                        let fitem = x.replace(/^ /g, '')
                        fitem = fitem.replace(/ /g, '-');
                        check("webAPIs/" + fname, 'hasTag', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/' + fitem + '> ');
                        check("tags/" + fitem, 'assignedInApi', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                        // console.log(fitem)
                    })
                }

            }

            if(item.category!="")
            {
                item.category.map(function (x) {
                    let fitem = x.replace(/ /g, '-');
                    check("webAPIs/" + fname, 'hasCategory', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/categories/' + fitem + '> ');
                    check("categories/" + fitem, 'isCategoryOf', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                    // console.log(fitem)
                })
            }

            if(item.provider!="")
            {
                    let fitem = item.provider.replace(/ /g, '-');
                    check("webAPIs/" + fname, 'hasProvider', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/providers/' + fitem + '> ');
                    check("providers/" + fitem, 'isProviderOf', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                    // console.log(fitem)
                
            }

            if(item.architecturalModel!="")
            {
                    let fitem = item.architecturalModel.replace(/ /g, '-');
                    check("webAPIs/" + fname, 'hasProtocol', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/protocols/' + fitem + '> ');
                    check("protocols/" + fitem, 'isProtocolOf', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                    // console.log(fitem)
                
            }


            if(item.supportedRequestFormats!="")
            {
                    let res = doc.api.supportedRequestFormats.split(", ");
                    res.map(function (x) {
                        let fitem = x.replace(/^ /g, '')
                        fitem = fitem.replace(/ /g, '-');
                        check("webAPIs/" + fname, 'hasSupportedReqFormat', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/dataReqFormats/' + fitem + '> ');
                        check("dataReqFormats/" + fitem, 'isSupportedReqFormatOf', '<https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/' + fname + '> ');
                        console.log(fitem)
                    })                
            }


            if(item.supportedResponseFormats!="")
            {
                    let res = doc.api.supportedResponseFormats.split(", ");
                    res.map(function (x) {
                        let fitem = x.replace(/^ /g, '')
                        fitem = fitem.replace(/ /g, '-');
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


function addTtl(one, two, three) {

    one = '<https://thesis-server-icsd14052-54.herokuapp.com/ns/' + one + '> ';

    if (two == "type") {

        two = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#' + two + '> ';
    } else {
        two = '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#' + two + '> ';
    }


    three = three + " . \n";

    fs.appendFile('./owl/triples.ttl', one + two + three, function (err) {
        if (err) throw err;
    });

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