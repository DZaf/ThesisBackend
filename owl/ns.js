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

router.get('/tags/:name', (req, res) => {

    res.send("i am an ontology");
    
});

router.get('/categories/:name', (req, res) => {

    res.send("i am an ontology");
    
});

router.get('/providers/:name', (req, res) => {

    res.send("i am an ontology");
    
});

router.get('/protocols/:name', (req, res) => {

    res.send("i am an ontology");
    
});

router.get('/dataReqFormats/:name', (req, res) => {

    res.send("i am an ontology");
    
});

router.get('/dataResFormats/:name', (req, res) => {

    res.send("i am an ontology");
    
});

module.exports = router;