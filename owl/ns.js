const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Apidb = require('../mongo-models/apidb-model')
const fs = require('fs');
const request = require('request');



mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
});

router.get('/', (req, res) => {

    res.send("i am an ontology");

});

router.get('/tags/:name?', (req, res) => {
    console.log("hi2");
    if(req.params.name)
    {
        tagName = req.params.name;
        query="SELECT ?tagName ?type WHERE {<https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/"+tagName+"> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Tags>. <https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/"+tagName+"> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?tagName. <https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/"+tagName+"> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type.}";
   
    }else{
        query="SELECT ?tagName ?type WHERE {?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Tags>.?aTag <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?tagName. ?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type.}";
    }
    request.get({url: "https://enoikio-database.herokuapp.com/ds/query", qs: {"query": query ,"output":"json"}}, function(err, response, body) {
        //εδω εκτυπωνονται μονο τα ελεμεντ
        // (JSON.parse(body).results.bindings).forEach(element => {
        //     console.log("----------------------------------------------------")
        //     console.log(element)
        //     console.log("----------------------------------------------------")
            
        // });
        res.send(JSON.parse(body).results);
    })
});

router.get('/categories/:name', (req, res) => {

    res.send("i am a category ontology");
    
});

router.get('/providers/:name', (req, res) => {

    res.send("i am a provider ontology");
    
});

router.get('/protocols/:name', (req, res) => {

    res.send("i am a protocol ontology");
    
});

router.get('/dataReqFormats/:name', (req, res) => {

    res.send("i am a dataReqFormat ontology");
    
});

router.get('/dataResFormats/:name', (req, res) => {

    res.send("i am a dataResFormats ontology");
    
});

router.get('/webAPIs/:name', (req, res) => {

    res.send("i am a webAPI ontology");
    
});

module.exports = router;