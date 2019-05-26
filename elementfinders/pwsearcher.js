var express = require('express');
const mongoose = require("mongoose");
const Apisio = require('../mongo-models/pw-model.js')
const router = express.Router();
const fs = require('fs');

mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
});


router.get('/', function (req, res, next) {
    res.send('respond element finder pw');
});

router.get('/txtwriter', function (req, res, next) {
    Apisio.find({}, function(err, element) {
        //console.log(element);
        fs.appendFile('pwallitems.txt', JSON.stringify(element)+",\n", function (err) {
            if (err) throw err;
        });
      });
      res.send("ok");  
});

router.get('/txtcrawler', function (req, res, next) {
    var filename = 'pwallitems.txt';
    var str = fs.readFileSync(filename).toString();
    var pattern = /("(\w[ ]?[\/]?[\W]?)*":)/g;
    var dirtyarray = str.match(pattern);
    var len = dirtyarray.length;
    var cleanarray=[];
    console.log(len)
    dirtyarray.forEach(dirtyitem=>{
        cleanarray.push(dirtyitem.replace(/":?/g,''))
    })
    var unique = cleanarray.filter(onlyUnique);
    console.log(unique.length+'\n');
    unique.forEach(string =>{
        fs.appendFile('pwelements.txt', string+",\n", function (err) {
            if (err) throw err;
        });
    })
    res.send('finished'); 
});

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

module.exports = router;