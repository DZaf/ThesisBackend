var express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
var data = require('../crawlers/apisguru/apisguru.json');
const fs = require('fs');

router.get('/', function (req, res, next) {
    res.send('respond element finder apiguru');
});

router.get('/txtwriter', function (req, res, next) {
    data.forEach(element => {
        console.log(element);
        fs.appendFile('allitems.txt', JSON.stringify(element)+",\n", function (err) {
            if (err) throw err;
        });
    });
    res.send('finished');
});

router.get('/txtcrawler', function (req, res, next) {
    var filename = 'allitems.txt';
    var str = fs.readFileSync(filename).toString();
    var pattern = /("[\w*-?]*":)/g;
    var dirtyarray = str.match(pattern);
    var len = dirtyarray.length;
    console.log(len+"\n");
    var cleanarray=[];
    var nodigitarray=[];
    dirtyarray.forEach(dirtyitem=>{
        cleanarray.push(dirtyitem.replace(/":?/g,''))
    })
    cleanarray.forEach(numbereditem=>{
        if(numbereditem.match(/\d/gm))
        {
            //console.log(numbereditem);
        }
        else{
            nodigitarray.push(numbereditem);
        }
    })
    var unique = nodigitarray.filter(onlyUnique);
    console.log(unique.length+'\n');
    unique.forEach(string =>{
        fs.appendFile('allelements.txt', string+",\n", function (err) {
            if (err) throw err;
        });
    })
    res.send('finished'); 
});

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

module.exports = router;