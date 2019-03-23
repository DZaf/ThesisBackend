const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.send('respond Github');
  });

  router.get('/:search/:language', (req, res) => {
    // console.log(req.params.search);
    if (req.params.search) {
    // "https://api.github.com/search/repositories?q="+req.params.search+"+language:python&sort=stars&order=desc"
    q = req.params.search+'+language:'+req.params.language;
    sort="stars";
    order="desc";    
    octokit.search.repos({q, sort, order}).then(result => {
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
    sort="stars";
    order="desc";    
    octokit.search.repos({q, sort, order}).then(result => {
        if(parseInt(result.data.total_count)>0)
        {
            
            var viewData = { 
                repos : [] 
            };
            result.data.items.forEach(function(repo) {
                var jsonData = {};
                jsonData["repo_name"]=repo.name;
                jsonData["owner_name"]=repo.owner.login;
                jsonData["owner_avatar_url"]=repo.owner.avatar_url;
                jsonData["owner_url"]=repo.owner.url;
                viewData.repos.push(jsonData);
                console.log(jsonData);
              });
            // console.log(result.data.items);
             console.log(viewData);
             res.send(viewData);
            
            // res.send(result.data.items);
        }
        else{
            res.send("no result found");
        }
        
        
    });

    } else {
        res.send('hello world!!!')
    }

});

  module.exports = router;