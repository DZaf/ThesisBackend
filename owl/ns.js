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
        query="select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/"+tagName+"> ?predicate ?object}";
   
    }else{
        query="SELECT ?tagName ?type WHERE {?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Tags>.?aTag <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?tagName. ?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type.}";
    }
    request.get({url: "https://enoikio-database.herokuapp.com/ds/query", qs: {"query": query ,"output":"json"}}, function(err, response, body) {
     
        //res.send(JSON.parse(body).results.bindings[0].type.value);
        //res.send(JSON.parse(body).results.bindings);
        let AssignedTagOf = JSON.parse(body).results.bindings.length;
console.log(AssignedTagOf);
        // let title = JSON.parse(body).results.bindings[0].tagName.value;
         let type = "tag";
         res.send(nsPrintTags(tagName,type,parseInt(AssignedTagOf)-2));
    })
});



// router.get('/:ontology/:name?', (req, res) => {
    
//     if(req.params['name'] && req.params['ontology'])
//     {
        
//         queryName= "";
//         ontologyName = req.params['name'];
//         ontology = req.params['ontology'];
//         queryName = "ontologyName";
        
//         console.log(queryName);
//         query="SELECT ?"+queryName+" ?type WHERE {<https://thesis-server-icsd14052-54.herokuapp.com/ns/"+ontology+"/"+ontologyName+"> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#"+ontology.capitalize()+">. <https://thesis-server-icsd14052-54.herokuapp.com/ns/"+ontology+"/"+ontologyName+"> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?"+queryName+". <https://thesis-server-icsd14052-54.herokuapp.com/ns/"+ontology+"/"+ontologyName+"> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type.}";
        
//     }else{
//         query="SELECT ?tagName ?type WHERE {?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#"+ontology+">.?aTag <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?tagName. ?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type.}";
//     }
//     request.get({url: "https://enoikio-database.herokuapp.com/ds/query", qs: {"query": query ,"output":"json"}}, function(err, response, body) {
//         //εδω εκτυπωνονται μονο τα ελεμεντ
//         // (JSON.parse(body).results.bindings).forEach(element => {
//         //     console.log("----------------------------------------------------")
//         //     console.log(element)
//         //     console.log("----------------------------------------------------")
            
//         // });
//         //res.send(JSON.parse(body).results.bindings[0][queryName].value);
//         res.send(JSON.parse(body).results.bindings);
//         //let AssignedTagOf = JSON.parse(body).results.bindings.length;

//         // let title = JSON.parse(body).results.bindings[0][queryName].value;
//         // let type = JSON.parse(body).results.bindings[0].type.value;
//         // res.send(nsPrint(ontologyName,title,type));

//         //res.send(body)
//     })
// });


router.get('/categories/:name', (req, res) => {

    if(req.params.name)
    {
        categoryName = req.params.name;
        query="select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/categories/"+categoryName+"> ?predicate ?object}";
   
    }else{
        query="SELECT ?categoryName ?type WHERE {?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Categories>.?aTag <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?categoryName. ?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type.}";
    }
    request.get({url: "https://enoikio-database.herokuapp.com/ds/query", qs: {"query": query ,"output":"json"}}, function(err, response, body) {
    
        //res.send(JSON.parse(body).results.bindings[0].type.value);
        //res.send(JSON.parse(body).results.bindings);
        let AssignedCategoryOf = JSON.parse(body).results.bindings.length;
console.log(AssignedCategoryOf);
        // let title = JSON.parse(body).results.bindings[0].tagName.value;
         let type = "category";
         res.send(nsPrintCategories(categoryName,type,parseInt(AssignedCategoryOf)-2));
    })
    
});

router.get('/providers/:name', (req, res) => {

    if(req.params.name)
    {
        providerName = req.params.name;
        query="select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/providers/"+providerName+"> ?predicate ?object}";
   
    }else{
        query="SELECT ?providerName ?type WHERE {?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Providers>.?aTag <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?providerName. ?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type.}";
    }
    request.get({url: "https://enoikio-database.herokuapp.com/ds/query", qs: {"query": query ,"output":"json"}}, function(err, response, body) {
      
        //res.send(JSON.parse(body).results.bindings[0].type.value);
        //res.send(JSON.parse(body).results.bindings);
        let isProviderOf = JSON.parse(body).results.bindings.length;
console.log(isProviderOf);
        // let title = JSON.parse(body).results.bindings[0].tagName.value;
         let type = "provider";
         res.send(nsPrintProviders(providerName,type,parseInt(isProviderOf)-2));
    })    
});

router.get('/protocols/:name', (req, res) => {

    if(req.params.name)
    {
        protocolName = req.params.name;
        query="select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/providers/"+protocolName+"> ?predicate ?object}";
   
    }else{
        query="SELECT ?protocolName ?type WHERE {?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Protocols>.?aTag <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?protocolName. ?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type.}";
    }
    request.get({url: "https://enoikio-database.herokuapp.com/ds/query", qs: {"query": query ,"output":"json"}}, function(err, response, body) {
      
        //res.send(JSON.parse(body).results.bindings[0].type.value);
        //res.send(JSON.parse(body).results.bindings);
        let isProtocolOf = JSON.parse(body).results.bindings.length;
console.log(isProtocolOf);
        // let title = JSON.parse(body).results.bindings[0].tagName.value;
         let type = "provider";
         res.send(nsPrintProtocols(protocolName,type,parseInt(isProtocolOf)-2));
    })        
});

router.get('/dataReqFormats/:name', (req, res) => {

    if(req.params.name)
    {
        dataReqFormatsName = req.params.name;
        query="select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/dataReqFormats/"+dataReqFormatsName+"> ?predicate ?object}";
   
    }else{
        query="SELECT ?dataReqFormatsName ?type WHERE {?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#dataReqFormats>.?aTag <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?dataReqFormatsName. ?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type.}";
    }
    request.get({url: "https://enoikio-database.herokuapp.com/ds/query", qs: {"query": query ,"output":"json"}}, function(err, response, body) {
       
        //res.send(JSON.parse(body).results.bindings[0].type.value);
        //res.send(JSON.parse(body).results.bindings);
        let isSupportedReqFormatTo = JSON.parse(body).results.bindings.length;
console.log(isSupportedReqFormatTo);
        // let title = JSON.parse(body).results.bindings[0].tagName.value;
         let type = "provider";
         res.send(nsPrintdataReqFormats(dataReqFormatsName,type,parseInt(isSupportedReqFormatTo)-2));
    })         
});

router.get('/dataResFormats/:name', (req, res) => {

    if(req.params.name)
    {
        dataResFormatsName = req.params.name;
        query="select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/dataResFormats/"+dataResFormatsName+"> ?predicate ?object}";
   
    }else{
        query="SELECT ?dataResFormatsName ?type WHERE {?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#dataResFormats>.?aTag <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?dataResFormatsName. ?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type.}";
    }
    request.get({url: "https://enoikio-database.herokuapp.com/ds/query", qs: {"query": query ,"output":"json"}}, function(err, response, body) {
       
        //res.send(JSON.parse(body).results.bindings[0].type.value);
        //res.send(JSON.parse(body).results.bindings);
        let isSupportedResFormatTo = JSON.parse(body).results.bindings.length;
console.log(isSupportedResFormatTo);
        // let title = JSON.parse(body).results.bindings[0].tagName.value;
         let type = "provider";
         res.send(nsPrintdataResFormats(dataResFormatsName,type,parseInt(isSupportedResFormatTo)-2));
    })  
    
});

router.get('/webAPIs/:name', (req, res) => {

    if(req.params.name)
    {
        apiName = req.params.name;
        query="select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/"+apiName+"> ?predicate ?object}";
   
    }else{
        query="SELECT ?dataResFormatsName ?type WHERE {?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#dataResFormats>.?aTag <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?dataResFormatsName. ?aTag <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type.}";
    }
    request.get({url: "https://enoikio-database.herokuapp.com/ds/query", qs: {"query": query ,"output":"json"}}, function(err, response, body) {
       
        //res.send(JSON.parse(body).results.bindings[0].type.value);
        res.send(JSON.parse(body).results.bindings);
        //let isSupportedResFormatTo = JSON.parse(body).results.bindings.length;
        //console.log(isSupportedResFormatTo);
        // let title = JSON.parse(body).results.bindings[0].tagName.value;
         let type = "web API";
         //res.send(nsPrintApis(apiName,type));
    })      
});



function nsPrintTags(ontology, type,assingedNum){
    if(assingedNum<0){
        assingedNum = 0;
    }
    style = `tr:nth-child(even) {
        background-color:  	#66B2FF;
      }
      table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }
      
      td, th {
        border: 1px solid  	#66B2FF;
        text-align: left;
        padding: 8px;
      }
      a{
        text-decoration: none;
      }`;

      body = `
      <html>
        <header>
        <style>${style}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#assignedInApi">assignedInApi</a></td><td>${assingedNum}</td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">${type}</a></td></tr></table>
        </body>
        </html>
      `
return body;
}

function nsPrintCategories(ontology, type,assingedNum){
    if(assingedNum<0){
        assingedNum = 0;
    }
    style = `tr:nth-child(even) {
        background-color:  	#66B2FF;
      }
      table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }
      
      td, th {
        border: 1px solid  	#66B2FF;
        text-align: left;
        padding: 8px;
      }
      a{
        text-decoration: none;
      }`;

      body = `
      <html>
        <header>
        <style>${style}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#isCategoryOf">isCategoryOf</a></td><td>${assingedNum}</td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">${type}</a></td></tr></table>
        </body>
        </html>
      `
return body;
}

function nsPrintProviders(ontology, type,assingedNum){
    if(assingedNum<0){
        assingedNum = 0;
    }
    style = `tr:nth-child(even) {
        background-color:  	#66B2FF;
      }
      table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }
      
      td, th {
        border: 1px solid  	#66B2FF;
        text-align: left;
        padding: 8px;
      }
      a{
        text-decoration: none;
      }`;

      body = `
      <html>
        <header>
        <style>${style}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#isProviderOf">isProviderOf</a></td><td>${assingedNum}</td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">${type}</a></td></tr></table>
        </body>
        </html>
      `
return body;
}

function nsPrintProtocols(ontology, type,assingedNum){
    if(assingedNum<0){
        assingedNum = 0;
    }
    style = `tr:nth-child(even) {
        background-color:  	#66B2FF;
      }
      table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }
      
      td, th {
        border: 1px solid  	#66B2FF;
        text-align: left;
        padding: 8px;
      }
      a{
        text-decoration: none;
      }`;

      body = `
      <html>
        <header>
        <style>${style}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#isProtocolOf">isProtocolOf</a></td><td>${assingedNum}</td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">${type}</a></td></tr></table>
        </body>
        </html>
      `
return body;
}

function nsPrintdataReqFormats(ontology, type,assingedNum){
    if(assingedNum<0){
        assingedNum = 0;
    }
    style = `tr:nth-child(even) {
        background-color:  	#66B2FF;
      }
      table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }
      
      td, th {
        border: 1px solid  	#66B2FF;
        text-align: left;
        padding: 8px;
      }
      a{
        text-decoration: none;
      }`;

      body = `
      <html>
        <header>
        <style>${style}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#isSupportedReqFormatTo">isSupportedReqFormatTo</a></td><td>${assingedNum}</td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">${type}</a></td></tr></table>
        </body>
        </html>
      `
return body;
}

function nsPrintdataResFormats(ontology, type,assingedNum){
    if(assingedNum<0){
        assingedNum = 0;
    }
    style = `tr:nth-child(even) {
        background-color:  	#66B2FF;
      }
      table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }
      
      td, th {
        border: 1px solid  	#66B2FF;
        text-align: left;
        padding: 8px;
      }
      a{
        text-decoration: none;
      }`;

      body = `
      <html>
        <header>
        <style>${style}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#isSupportedResFormatTo">isSupportedResFormatTo</a></td><td>${assingedNum}</td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">${type}</a></td></tr></table>
        </body>
        </html>
      `
return body;
}

function nsPrintApis(ontology, type){
    
    style = `tr:nth-child(even) {
        background-color:  	#66B2FF;
      }
      table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }
      
      td, th {
        border: 1px solid  	#66B2FF;
        text-align: left;
        padding: 8px;
      }
      a{
        text-decoration: none;
      }`;

      body = `
      <html>
        <header>
        <style>${style}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#isSupportedResFormatTo">isSupportedResFormatTo</a></td><td>${assingedNum}</td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">${type}</a></td></tr></table>
        </body>
        </html>
      `
return body;
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = router;