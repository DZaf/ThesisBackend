// const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Octokit = require('@octokit/rest')
const octokit = new Octokit()
// const fetch = require('node-fetch');
const REPOSITORY_PER_PAGE = "1";
const request = require('request');

router.get('/', function (req, res, next) {
    res.send('respond Github');
});

router.post("/content/", (req, res) => {
    url = req.body.url;
    request(url, function (error, response, body) {

        res.send(body); // Print the HTML for the Google homepage.
      });
})

router.get('/:search/:language', (req, res) => {
    // console.log(req.params.search);
    if (req.params.search) {
        // "https://api.github.com/search/repositories?q="+req.params.search+"+language:python&sort=stars&order=desc"
        q = req.params.search + '+language:' + req.params.language;
        sort = "stars";
        order = "desc";
        octokit.search.repos({ q, sort, order }).then(result => {
            console.log(result.data.items);
            res.send(result.data.items);
        });

    } else {
        res.send('hello world!!!')
    }

});

router.get('/:search', (req, res) => {
    // console.log(req.params.search);
    if (req.params.search) {
        // "https://api.github.com/search/repositories?q="+req.params.search+"+language:python&sort=stars&order=desc"
        q = req.params.search;
        sort = "stars";
        order = "desc";
        per_page = REPOSITORY_PER_PAGE;
        page = "1"

        octokit.search.repos({ q, sort, order, per_page, page }).then(result => {
            if (parseInt(result.data.total_count) > 0) {
                //console.log(result.data);
                var viewData = {
                    repos: []
                };
                result.data.items.forEach(function (reposi) {
                    var jsonData = {};

                    jsonData["owner_name"] = reposi.owner.login;
                    jsonData["owner_avatar_url"] = reposi.owner.avatar_url;
                    jsonData["owner_url"] = reposi.owner.html_url;
                    jsonData["repo_name"] = reposi.name;
                    jsonData["repo_url"] = reposi.html_url;
                    jsonData["repo_language"] = reposi.language;
                    jsonData["repo_url"] = reposi.html_url;
                    jsonData["repo_language"] = reposi.language;
                    jsonData["repo_score"] = reposi.score;
                    owner = reposi.owner.login;
                    repo = reposi.name;
                    path = "";
                    jsonData["repo_tree"] = [];
                    octokit.repos.getContents({ owner, repo, path }).then(result => {
                        if (result.data) {
                            result.data.forEach(function (file) {
                                var tree_json = {}
                                tree_json["type"] = file.type;
                                tree_json["name"] = file.name;
                                //  console.log(file.name);
                                if (file.type == "dir") {
                                    tree_json["conten_url"] = file.git_url;
                                }
                                else {
                                    //console.log(file.download_url);
                                    tree_json["conten_url"] = file.download_url;
                                }
                                console.log("--------------/-------------");
                                jsonData["repo_tree_size"] = jsonData["repo_tree"].length;
                                jsonData["repo_tree"].push(tree_json);
                                console.log(jsonData);
                                console.log("-------------!--------------");
                                // console.log(tree_json);
                                // console.log("----------------------------");
                            });


                        }
                    }).catch(error => {
                        console.log(error);
                        console.log("no result");
                        jsonData["repo_tree_size"] = 0;
                    }).then(() => {
                        viewData.repos.push(jsonData)
                        res.send(viewData);
                    });

                });
            }
            else {
                res.send("no result found");
            }


        });

    } else {
        res.send('hello world!!!')
    }

});


module.exports = router;