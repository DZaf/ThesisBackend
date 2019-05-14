var express = require('express');
var app = express()
const http = require('http');
const Apisio = require('../../mongo-models/apis-model')
const mongoose = require("mongoose");
const router = express.Router();

mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
});

router.get('/', function (req, res, next) {
    res.send('respond apis crawler');
});

router.get('/apisio/:q', function(req, res) {
    if (req.params.q) {
        var q = req.params.q
        console.log(q)

        try {
            http.get('http://apis.io/api/search?q=' + q + '&limit=120', (resp) => {
                let data = '';
                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                        JSON.parse(data).data.forEach(element => {
                        Apisio.findOne({
                            apisioAPI: element
                        }).then(docs => {
                            if (docs) {
                                console.log("iparxei");
                            } else {
                                //console.log("dn iparxei");
                                const apisio = new Apisio({ apisioAPI: element });
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