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

router.get("/content/", (req, res) => {
    if (req.query.url) {
        url = req.query.url;
        console.log(url);
        request(url, function (error, response, body) {

            res.send(body); // Print the HTML for the Google homepage.
        });
    } else {
        res.status("400").send({ "code": "400", "message": "url is required" })
    }

});

router.get("/content/dir/:owner/:repo_name", (req, res) => {
    if (req.params.owner) {
        if (req.params.repo_name) {
            if (req.query.path) {
                jsonData = {};
                owner = req.params.owner;
                repo = req.params.repo_name;
                path = req.query.path;
                jsonData["owner"]=owner;
                jsonData["repo_name"]=repo;
                jsonData["path"]=path;
                jsonData["dir_tree"] = [];
                octokit.repos.getContents({ owner, repo, path}).then(result => {

                    result.data.forEach(function (file) {
                        var dir_json = {}
                        dir_json["name"]=file.name;
                        dir_json["path"]=file.path;
                        dir_json["url"]=file.html_url;
                        dir_json["type"]=file.type;
                        dir_json["conten_url"]=file.download_url;
                        if(file.type=="dir")
                        {
                            dir_json["isdir"]=true;
                        }else{
                            dir_json["isdir"]=false;
                            dir_json["conten_url"]=file.download_url;
                        }
                        jsonData["dir_tree"].push(dir_json);

                    });
                    res.status("200").send(jsonData);


                   
                    
                })

            } else {
                res.status("400").send({ "code": "400", "message": "path is required" })
            }
        } else {
            res.status("400").send({ "code": "400", "message": "repo_name is required" })
        }
    } else {
        res.status("400").send({ "code": "400", "message": "owner is required" })
    }

});

router.get('/:search/(:language)?', (req, res) => {

    if (req.params.search) {
        // "https://api.github.com/search/repositories?q="+req.params.search+"+language:python&sort=stars&order=desc"
        q = req.params.search;
        if (req.params.language) {
            console.log(req.params.language);
            q = req.params.search + '+language:' + req.params.language;
        }
        else { q = req.params.search; }

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
                                tree_json["path"] = file.path;
                                //  console.log(file.name);
                                if (file.type == "dir") {
                                    tree_json["isdir"] = true;
                                    tree_json["conten_url"]=file.download_url;
                                }
                                else {
                                    //console.log(file.download_url);
                                    tree_json["isdir"] = false;
                                    tree_json["conten_url"] = file.download_url;
                                }
                                // console.log("--------------/-------------");
                                jsonData["repo_tree_size"] = jsonData["repo_tree"].length;
                                jsonData["repo_tree"].push(tree_json);
                                // console.log(jsonData);
                                // console.log("-------------!--------------");
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