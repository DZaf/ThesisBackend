const express = require("express");
const app= express();
const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', { useNewUrlParser: true });

app.get('/',(req,res)=>{
    res.send('hello world!!')
});

app.listen(3000, ()=>console.log("listening on port 3000"));