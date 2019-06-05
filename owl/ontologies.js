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
                    var flag= false;
                    let res = doc.api.tags.map(function (x) {
                        if (x.indexOf(',') > -1) {
                            let splited= x.split(",")
                            flag =true;
                            return splited
                        } else{ flag =false; return x;}
                    })
                    if(flag)
                    {
                        res[0].map(function (x) {
                            tags.push(x)
                        }) 
                    }
                    else{
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




            // fs.appendFile('./owl/triples.ttl', '', function (err) {
            //     if (err) throw err;
            // });



        })
        .on('error', function (err) {
            // handle error
        })
        .on('end', function () {
            tags = tags.map(function (x) {
                return String(x).toLowerCase().replace(/^ /g, '')
            })
            categories = categories.map(function (x) {
                return x.toLowerCase()
            })
            taprovidersgs = providers.map(function (x) {
                return x.toLowerCase()
            })
            protocols = protocols.map(function (x) {
                return x.toLowerCase()
            })
            dataReqFormat = dataReqFormat.map(function (x) {
                return x.toLowerCase()
            })
            dataResFormat = dataResFormat.map(function (x) {
                return x.toLowerCase()
            })

            distTags = tags.filter(onlyUnique);
            distCategories = categories.filter(onlyUnique);
            distProviders = providers.filter(onlyUnique);
            distProtocols = protocols.filter(onlyUnique);
            distDataReqFormat = dataReqFormat.filter(onlyUnique);
            distDataResFormat = dataResFormat.filter(onlyUnique);

            distTags.forEach(function (item) {
                let fitem = item.replace(/\w /g, '-');

                addTtl("tags/"+fitem, 'title', '"' + item + '"');
                addTtl("tags/"+fitem, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Tags>');

            });

            distCategories.forEach(function (item) {
                let fitem = item.replace(/ /g, '-');

                addTtl("categories/"+fitem, 'title', '"' + item + '"');
                addTtl("categories/"+fitem, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Category>');

            });

            distProviders.forEach(function (item) {
                let fitem = item.replace(/ /g, '-');

                addTtl("providers/"+fitem, 'title', '"' + item + '"');
                addTtl("providers/"+fitem, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Provider>');

            });

            distProtocols.forEach(function (item) {
                let fitem = item.replace(/ /g, '-');

                addTtl("protocols/"+fitem, 'title', '"' + item + '"');
                addTtl("protocols/"+fitem, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Protocols>');

            });

            distDataReqFormat.forEach(function (item) {
                let fitem = item.replace(/ /g, '-');

                addTtl("dataReqFormats/"+fitem, 'title', '"' + item + '"');
                addTtl("dataReqFormats/"+fitem, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#DataRequestFormat>');

            });

            distDataResFormat.forEach(function (item) {
                let fitem = item.replace(/ /g, '-');

                addTtl("dataResFormats/"+fitem, 'title', '"' + item + '"');
                addTtl("dataResFormats/"+fitem, 'type', '<https://thesis-server-icsd14052-54.herokuapp.com/ontologies#DataResponseFormat>');

            });


            console.log(distTags);
            // console.log(distDataReqFormat);

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




module.exports = router;