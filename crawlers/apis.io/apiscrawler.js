var express = require('express');
var app = express()
const http = require('http');
const Apisio = require('../../mongo-models/apis-model')
const mongoose = require("mongoose");
const router = express.Router();

mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
});

//----------------------INTRO PAGE--------------------
router.get('/', function (req, res, next) {
    res.send('respond apis crawler');
});
//----------------------GET EVERY API THAT BELONGS ON question RESULT--------------------
router.get('/apisio/:question', function(req, res) {
    if (req.params.question) {
        var question = req.params.question
        try {
            //SEND A GET REQUEST ON THE LINK BELOW WITH THE question WE WANT TO MAKE AND THE LIMIT OF RESULTS TO 120
            http.get('http://apis.io/api/search?q=' + question + '&limit=120', (resp) => {
                let data = '';
                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                        JSON.parse(data).data.forEach(element => {
                        //we check on the database if there is already the element in the database
                        Apisio.findOne({
                            apisioAPI: element
                        }).then(docs => {
                            //if there is in the database then we do nothing
                            if (docs) {
                                console.log("exists");
                            } else {
                                //if there isn't in the database then we create an object that contains the data of the element
                                const apisio = new Apisio({ apisioAPI: element });
                                //and we save the object to the database
                                apisio.save()
                                    .then(result => {
                                        console.log("ok");
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    });
                            }
                        });

                    });
                });

            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });
        } catch (error) {
            console.log("Error: " + error);
            res.status("400").send({ "code": "400", "message": error });
        } finally {
            res.status("200").send({ "code": "200" });
        }

    } else {
        res.status("400").send({ "code": "400", "message": "q is required" });
    }

})

module.exports = router;