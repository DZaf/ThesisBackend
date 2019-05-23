const puppeteer = require('puppeteer');
const $ = require('cheerio');
const express = require('express');
const app = express();
const fs = require('fs');
const lineReader = require('line-reader');
const Api = require('../../mongo-models/pw-model');
const mongoose = require('mongoose');
const router = express.Router();
// Set up the express app

mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
});

router.get('/', function (req, res, next) {
    res.send('respond programmable web crawler');
});

// First param is for starting page, second param is for final page
router.get('/:0/:1', (req, res) => {
    startPage = req.params[0];
    stopPage = req.params[1];
    //console.log(startPage + " " + stopPage);

    // crawl_per_page method call for retrieve api links from the range of the pages we give 
    crawl_per_page(startPage, stopPage).then((result) => {
        res.status(200).json({
            success: 'true',
            message: 'apis retrieved successfully',
            apis: result
        })
    });

});

router.get('/page/:start/:finish', (req, res) => {
    bigjson = {}
    bigjson["data"] = []
    var counter = -1;
    var start = req.params['start'];
    var finish = req.params['finish'];
    console.log(start);
    console.log(finish);
    // Links of the apis are given from the pwLinks.txt
    try {
        lineReader.eachLine('pwLinks.txt', function (line) {
            
            counter++;
            
            console.log("counter : " + counter);
            if (counter >= start)
            {
            // Line by line reading of the file and calling crawl_page method given the api link we take every time 
            crawl_page(line);
            }
            if (counter == finish)
            return false;
        })
    } catch (error) {
        console.log(error);

    } finally {
        res.status(200).json({
            success: 'true',
            message: 'apis retrieved successfully'
        })
    }

});

function crawl_page(link) {
    var url = "https://www.programmableweb.com" + link;
    // console.log(url);
    // return url;
    return puppeteer
        .launch()
        .then(function (browser) {
            return browser.newPage();
        })
        .then(function (page) {
            return page.goto(url)
                .then(function () {
                    return page.content();
                });
        })
        .then(function (html) {
            json = {}
            json["API Title"] = $('.node-header h1', html)[0].children[0].data;
            json["API Description"] = $('.intro .api_description', html)[0].children[0].data;
            $('#myTabContent .specs .field', html).each(function () {

                // SPAN LABEL
                if ($(this)[0].children[2].next.children[0].type == "text") {
                    json['' + $(this)[0].children[0].next.children[0].data] = $(this)[0].children[2].next.children[0].data;
                }
                //URL
                if ($(this)[0].children[2].next.children[0].type == "tag") {
                    json['' + $(this)[0].children[0].next.children[0].data] = $(this)[0].children[2].next.children[0].attribs.href;
                }
            })

            const api = new Api({
                pwAPI: json
            });

            api // Κάνουμε save για να αποθηκευτεί στη βάση και μετά επιστρέφουμε κατάλληλο μήνυμα αν όλα πήγαν καλά και αντίστοιχα αν προέκυψε σφάλμα
                .save()
                .then(result => {

                    console.log(result);

                })
                .catch(err => {
                    console.log(err);

                });

        })
        .catch(function (err) {
            console.log(err)
            return err
        });
}


function crawl_per_page(page, upperlimit) {
    console.log("page: " + page);
    if (page > 0) {
        var url = 'https://www.programmableweb.com/category/all/apis?order=created&sort=desc&page=' + page;
    } else {
        var url = 'https://www.programmableweb.com/category/all/apis?order=created&sort=desc';
    }
    var apis_per_page = [];

    return puppeteer
        .launch()
        .then(function (browser) {
            return browser.newPage();
        })
        .then(function (page) {
            return page.goto(url).then(function () {
                return page.content();
            });
        })
        .then(function (html) {
            console.log($('.table tbody tr .views-field-title a', html));
            $('.table tbody tr .views-field-title a', html).each(function () {
                console.log("2");
                fs.appendFile('pwLinks.txt', '' + "https://www.programmableweb.com" + $(this)[0].attribs.href + '\n', function (err) {
                    if (err) throw err;
                });
                //console.log($(this)[0].attribs.href);
            });
            if (page == upperlimit) {
                console.log("4");
                return "ok"
            } else {
                console.log("3");

                return crawl_per_page(parseInt(page) + 1, upperlimit);
            }
        })
        .catch(function (err) {
            console.log(err)
            return err
        });
}

router.delete('/deleteCollection', (req, res) => {

    mongoose.connection.db.dropCollection('apis', function (err, result) {
        console.log(result)
    });

});

module.exports = router;