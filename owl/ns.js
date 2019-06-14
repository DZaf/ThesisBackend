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
/* ------------------------------TAGS----------------------------------------- */
router.get('/tags/:name?', (req, res) => {
  console.log("hi2");
  if (req.params.name) {
    tagName = req.params.name;
    query = "select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/tags/" + tagName + "> ?predicate ?object}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {

      //res.send(JSON.parse(body).results.bindings[0].type.value);
      //res.send(JSON.parse(body).results.bindings);
      let AssignedTagOf = JSON.parse(body).results.bindings.length;
      console.log(AssignedTagOf);
      // let title = JSON.parse(body).results.bindings[0].tagName.value;
      let type = "tag";
      res.send(nsPrintTags(tagName, type, parseInt(AssignedTagOf) - 2));
    })

  } else {
    query = "select * where{?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Tags>.?subject <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?object.}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {
      console.log(JSON.parse(body).results.bindings.length);
      json = JSON.parse(body).results.bindings;
      //console.log(json[i].subject.value)
      //res.send(json);
      var tr = "";
      for (var i = 0; i < json.length; i++) {
        var obj = json[i];
        tr = tr + `<tr><td><a href="${json[i].subject.value}">${json[i].object.value}</a></td></tr>`;
        //console.log(obj);
      }


      body = `
        <html>
          <header>
          <style>${getTableStyle()}</style>
          </header>
          <body>
          <table>${tr}</table>
          </body>
          </html>
        `

      res.send(body);


    })
  }

});

/* ------------------------------CATEGORIES----------------------------------------- */

router.get('/categories/:name?', (req, res) => {

  if (req.params.name) {
    categoryName = req.params.name;
    query = "select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/categories/" + categoryName + "> ?predicate ?object}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {

      //res.send(JSON.parse(body).results.bindings[0].type.value);
      //res.send(JSON.parse(body).results.bindings);
      let AssignedCategoryOf = JSON.parse(body).results.bindings.length;
      console.log(AssignedCategoryOf);
      // let title = JSON.parse(body).results.bindings[0].tagName.value;
      let type = "category";
      res.send(nsPrintCategories(categoryName, type, parseInt(AssignedCategoryOf) - 2));
    })

  } else {
    query = "select * where{?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Category>.?subject <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?object.}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {
      //res.send(JSON.parse(body));    
      console.log(JSON.parse(body).results.bindings.length);
      json = JSON.parse(body).results.bindings;

      var tr = "";
      for (var i = 0; i < json.length; i++) {
        var obj = json[i];
        tr = tr + `<tr><td><a href="${json[i].subject.value}">${json[i].object.value}</a></td></tr>`;
        //console.log(obj);
      }


      body = `
        <html>
          <header>
          <style>${getTableStyle()}</style>
          </header>
          <body>
          <table>${tr}</table>
          </body>
          </html>
        `

      res.send(body);


    })

  }


});
/* ------------------------------PROVIDERS----------------------------------------- */

router.get('/providers/:name?', (req, res) => {

  if (req.params.name) {
    providerName = req.params.name;
    query = "select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/providers/" + providerName + "> ?predicate ?object}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {

      //res.send(JSON.parse(body).results.bindings[0].type.value);
      //res.send(JSON.parse(body).results.bindings);
      let isProviderOf = JSON.parse(body).results.bindings.length;
      //console.log(isProviderOf);
      // let title = JSON.parse(body).results.bindings[0].tagName.value;
      let type = "provider";
      res.send(nsPrintProviders(providerName, type, parseInt(isProviderOf) - 2));
    })

  } else {
    query = "select * where{?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Provider>.?subject <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?object.}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {
      //console.log(JSON.parse(body));
      json = JSON.parse(body).results.bindings;
      var tr = "";
      for (var i = 0; i < json.length; i++) {
        var obj = json[i];
        tr = tr + `<tr><td><a href="${json[i].subject.value}">${json[i].object.value}</a></td></tr>`;
        //console.log(obj);
      }


      body = `
        <html>
          <header>
          <style>${getTableStyle()}</style>
          </header>
          <body>
          <table>${tr}</table>
          </body>
          </html>
        `

      res.send(body);


    })

  }

});
/* ------------------------------PROTOCOLS----------------------------------------- */

router.get('/protocols/:name?', (req, res) => {

  if (req.params.name) {
    protocolName = req.params.name;
    query = "select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/protocols/" + protocolName + "> ?predicate ?object}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {

      //res.send(JSON.parse(body).results.bindings[0].type.value);
      //res.send(JSON.parse(body).results.bindings);
      let isProtocolOf = JSON.parse(body).results.bindings.length;
      console.log(isProtocolOf);
      // let title = JSON.parse(body).results.bindings[0].tagName.value;
      let type = "protocol";
      res.send(nsPrintProtocols(protocolName, type, parseInt(isProtocolOf) - 2));
    })

  } else {
    query = "select * where{?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#Protocols>.?subject <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?object.}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {
      console.log(JSON.parse(body).results.bindings.length);
      json = JSON.parse(body).results.bindings;
      var tr = "";
      for (var i = 0; i < json.length; i++) {
        var obj = json[i];
        tr = tr + `<tr><td><a href="${json[i].subject.value}">${json[i].object.value}</a></td></tr>`;
        //console.log(obj);
      }


      body = `
        <html>
          <header>
          <style>${getTableStyle()}</style>
          </header>
          <body>
          <table>${tr}</table>
          </body>
          </html>
        `

      res.send(body);


    })


  }

});
/* ------------------------------DATAREQFORMATS----------------------------------------- */

router.get('/dataReqFormats/:name?', (req, res) => {

  if (req.params.name) {
    dataReqFormatsName = req.params.name;
    query = "select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/dataReqFormats/" + dataReqFormatsName + "> ?predicate ?object}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {

      //res.send(JSON.parse(body).results.bindings[0].type.value);
      //res.send(JSON.parse(body).results.bindings);
      let isSupportedReqFormatTo = JSON.parse(body).results.bindings.length;
      console.log(isSupportedReqFormatTo);
      // let title = JSON.parse(body).results.bindings[0].tagName.value;
      let type = "request format";
      res.send(nsPrintdataReqFormats(dataReqFormatsName, type, parseInt(isSupportedReqFormatTo) - 2));
    })

  } else {
    query = "select * where{?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#DataRequestFormat>.?subject <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?object.}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {
      console.log(JSON.parse(body).results.bindings.length);
      json = JSON.parse(body).results.bindings;
      var tr = "";
      for (var i = 0; i < json.length; i++) {
        var obj = json[i];
        tr = tr + `<tr><td><a href="${json[i].subject.value}">${json[i].object.value}</a></td></tr>`;
        //console.log(obj);
      }


      body = `
        <html>
          <header>
          <style>${getTableStyle()}</style>
          </header>
          <body>
          <table>${tr}</table>
          </body>
          </html>
        `

      res.send(body);


    })

  }

});
/* ------------------------------DATARESFORMATS----------------------------------------- */

router.get('/dataResFormats/:name?', (req, res) => {

  if (req.params.name) {
    dataResFormatsName = req.params.name;
    query = "select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/dataResFormats/" + dataResFormatsName + "> ?predicate ?object}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {

      //res.send(JSON.parse(body).results.bindings[0].type.value);
      //res.send(JSON.parse(body).results.bindings);
      let isSupportedResFormatTo = JSON.parse(body).results.bindings.length;
      console.log(isSupportedResFormatTo);
      // let title = JSON.parse(body).results.bindings[0].tagName.value;
      let type = "response format";
      res.send(nsPrintdataResFormats(dataResFormatsName, type, parseInt(isSupportedResFormatTo) - 2));
    })

  } else {
    query = "select * where{?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#DataResponseFormat>.?subject <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title> ?object.}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {
      console.log(JSON.parse(body).results.bindings.length);
      json = JSON.parse(body).results.bindings;
      var tr = "";
      for (var i = 0; i < json.length; i++) {
        var obj = json[i];
        tr = tr + `<tr><td><a href="/${json[i].subject.value}">${json[i].object.value}</a></td></tr>`;
        //console.log(obj);
      }


      body = `
        <html>
          <header>
          <style>${getTableStyle()}</style>
          </header>
          <body>
          <table>${tr}</table>
          </body>
          </html>
        `

      res.send(body);


    })

  }


});
/* ------------------------------APIS----------------------------------------- */

router.get('/webAPIs/:name?', (req, res) => {

  if (req.params.name) {
    apiName = req.params.name;
    query = "select ?predicate ?object where{ <https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs/" + apiName + "> ?predicate ?object}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {

      //res.send(JSON.parse(body).results.bindings[0].type.value);
      //res.send(JSON.parse(body).results.bindings);
      //let isSupportedResFormatTo = JSON.parse(body).results.bindings.length;
      //console.log(isSupportedResFormatTo);
      // let title = JSON.parse(body).results.bindings[0].tagName.value;
      let type = "web API";
      //res.send(nsPrintApis(apiName,type));
      var data = {};
      var tagsTd = "";
      var categoriesTd = "";
      (JSON.parse(body).results.bindings).forEach(element => {
        //console.log(element.predicate.value.replace(/.*#/g, '').replace(/>/g, ''));
        el = element.predicate.value.replace(/.*#/g, '').replace(/>/g, '');
        val = element.object.value;
        console.log(element);
        if (el == "hasTag") {
          tagsTd = tagsTd + `<li><a href="${val}">${val.replace(/^.*\//g,'')}</a></li>`
          data[el] = val;
        }
       else if (el == "hasCategory") {
        categoriesTd = categoriesTd + `<li><a href="${val}">${val.replace(/^.*\//g,'')}</a></li>`
          data[el] = val;
        }
       else if (el != "type") {
          data[el] = val;
        }

      });
      console.log (tagsTd)
      var tr = "";
      for (const key of Object.keys(data)) {
        console.log(key);
        if (key == "hasCategory"){
          tr = tr + `<tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#${key}">${key}</a></td><td><ul>${categoriesTd}</ul></td></tr>`;
        }
       else if(key == "hasTag"){
          tr = tr + `<tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#${key}">${key}</a></td><td><ul>${tagsTd}</ul></td></tr>`;
        }
        else if(data[key].includes("http"))
        {
          tr = tr + `<tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#${key}">${key}</a></td><td><a href="${data[key]}">${data[key]}</a></td></tr>`;
        }else{
        tr = tr + `<tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#${key}">${key}</a></td><td>${data[key]}</td></tr>`;
        }
      }
      //console.log(tr);
      tr = tr + `<tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/webAPIs">web API</a></td></tr>`;



      body = `
        <html>
          <header>
          <style>${getTableStyle()}</style>
          </header>
          <body>
          <h2>${apiName}</h2>
          <table>${tr}</table>
          </body>
          </html>
        `

      res.send(body);

    })

  } else {
    query = "select * where{?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#WebAPI>.?subject <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#name> ?object.}";

    request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {
      console.log(JSON.parse(body).results.bindings.length);
      json = JSON.parse(body).results.bindings;
      var tr = "";
      for (var i = 0; i < json.length; i++) {
        var obj = json[i];
        tr = tr + `<tr><td><a href="${json[i].subject.value}">${json[i].object.value}</a></td></tr>`;
        //console.log(obj);
      }


      body = `
        <html>
          <header>
          <style>${getTableStyle()}</style>
          </header>
          <body>
          <table>${tr}</table>
          </body>
          </html>
        `

      res.send(body);


    })

  }

});



function nsPrintTags(ontology, type, assingedNum) {
  if (assingedNum < 0) {
    assingedNum = 0;
  }


  body = `
      <html>
        <header>
        <style>${getTableStyle()}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#assignedInApi">assignedInApi</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/assigned/${ontology}/tags">${assingedNum}</a></td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology.replace(/-/g, ' ')}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/tags">${type}</a></td></tr></table>
        </body>
        </html>
      `
  return body;
}

function nsPrintCategories(ontology, type, assingedNum) {
  if (assingedNum < 0) {
    assingedNum = 0;
  }


  body = `
      <html>
        <header>
        <style>${getTableStyle()}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#isCategoryOf">isCategoryOf</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/assigned/${ontology}/categories">${assingedNum}</a></td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology.replace(/-/g, ' ')}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/categories">${type}</a></td></tr></table>
        </body>
        </html>
      `
  return body;
}

function nsPrintProviders(ontology, type, assingedNum) {
  if (assingedNum < 0) {
    assingedNum = 0;
  }


  body = `
      <html>
        <header>
        <style>${getTableStyle()}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#isProviderOf">isProviderOf</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/assigned/${ontology}/providers">${assingedNum}</a></td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology.replace(/-/g, ' ')}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/providers">${type}</a></td></tr></table>
        </body>
        </html>
      `
  return body;
}

function nsPrintProtocols(ontology, type, assingedNum) {
  if (assingedNum < 0) {
    assingedNum = 0;
  }


  body = `
      <html>
        <header>
        <style>${getTableStyle()}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#isProtocolOf">isProtocolOf</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/assigned/${ontology}/protocols">${assingedNum}</a></td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology.replace(/-/g, ' ')}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/protocols">${type}</a></td></tr></table>
        </body>
        </html>
      `
  return body;
}

function nsPrintdataReqFormats(ontology, type, assingedNum) {
  if (assingedNum < 0) {
    assingedNum = 0;
  }


  body = `
      <html>
        <header>
        <style>${getTableStyle()}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#isSupportedReqFormatTo">isSupportedReqFormatTo</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/assigned/${ontology}/dataReqFormats">${assingedNum}</a></td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology.replace(/-/g, ' ')}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/dataReqFormats">${type}</a></td></tr></table>
        </body>
        </html>
      `
  return body;
}

function nsPrintdataResFormats(ontology, type, assingedNum) {
  if (assingedNum < 0) {
    assingedNum = 0;
  }


  body = `
      <html>
        <header>
        <style>${getTableStyle()}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#isSupportedResFormatTo">isSupportedResFormatTo</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/assigned/${ontology}/dataResFormats">${assingedNum.replace(/-/g, ' ')}</a></td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ns/dataResFormats">${type}</a></td></tr></table>
        </body>
        </html>
      `
  return body;
}

function nsPrintApis(ontology, type) {


  body = `
      <html>
        <header>
        <style>${getTableStyle()}</style>
        </header>
        <body>
        <h2>${ontology}</h2>
        <table><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#isSupportedResFormatTo">isSupportedResFormatTo</a></td><td>${assingedNum}</td></tr><tr><td><a href="https://thesis-server-icsd14052-54.herokuapp.com/ontologies#title">Title</a></td><td>${ontology}</td></tr><tr><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">Type</a></td><td><a href="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">${type}</a></td></tr></table>
        </body>
        </html>
      `
  return body;
}

function getTableStyle() {

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
  return style;
}
//-----------------------------------ASSIGNED------------------------


router.get('/assigned/:name/:type', (req, res) => {
  console.log("hi2");
  if (req.params.name) {
    if (req.params.type) {
      tagName = req.params.name;
      type = req.params.type;
      var assigned;
      if (type == "tags") {
        assigned = "assignedInApi";
      } else if (type == "categories") {
        assigned = "isCategoryOf";
      }
      else if (type == "providers") {
        assigned = "isProviderOf";
      }
      else if (type == "protocols") {
        assigned = "isProtocolOf";
      }
      else if (type == "dataReqFormats") {
        assigned = "isSupportedReqFormatTo";
      }
      else if (type == "dataResFormats") {
        assigned = "isSupportedResFormatTo";
      }

      query = "select ?subject ?object where{<https://thesis-server-icsd14052-54.herokuapp.com/ns/" + type + "/" + tagName + "> <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#" + assigned + "> ?subject. ?subject <https://thesis-server-icsd14052-54.herokuapp.com/ontologies#name> ?object}"


      request.get({ url: "https://enoikio-database.herokuapp.com/ds/query", qs: { "query": query, "output": "json" } }, function (err, response, body) {
        console.log(JSON.parse(body).results.bindings.length);
        json = JSON.parse(body).results.bindings;

        var tr = "";
        for (var i = 0; i < json.length; i++) {
          var obj = json[i];
          tr = tr + `<tr><td><a href="${json[i].subject.value}">${json[i].object.value}</a></td></tr>`;

        }
        body = `
      <html>
        <header>
        <style>${getTableStyle()}</style>
        </header>
        <body>
        <table>${tr}</table>
        </body>
        </html>  `
        res.send(body);
      })
    }
  }
});


module.exports = router;