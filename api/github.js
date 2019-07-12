//Περιεχόμενο
// GET RAW CODE OF FILE
// GET TREE FILE OF A DIRECTORY
// GET SEARCH RESULTS
// const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Octokit = require('@octokit/rest')
const octokit = new Octokit()

//Μεταβλητή για το πόσα αποτελέσματα να επιστρέφει η αναζήτηση στο git ανα σελίδα
const REPOSITORY_PER_PAGE = "3";
//Μεταβλητή για το ποιά σελίδα θα επιστρέψει η αναζήτηση στο git
const GIT_SEARCH_PAGE = "3";
const request = require('request');

router.get('/', function (req, res, next) {
    res.send('respond Github');
});

// GET RAW CODE OF FILE
//Αν ο χρήστης "βρεί" ένα αρχείο (file) τότε στέλνει με αίτημα GET το "raw" λινκ σε μορφή ?url=RAW_FILE
//Παράδειγμα:
// http://127.0.0.1:3000/github/content/?url=https://raw.githubusercontent.com/dotnet-architecture/eShopOnContainers/dev/CONTRIBUTING.md 
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

// GET TREE FILE OF A DIRECTORY
//Αν ο χρήστης "βρεί" έναν φάκελο (dir) τότε στέλνει με αίτημα GET τα εξής:
// το όνομα του ιδιοκτήτη του repository :owner
// το όνομα του repository :repo_name
// και το path σε μορφή σε μορφή ?path=FILE_PATH
//Παράδειγμα:
// http://127.0.0.1:3000/github/content/dir/dotnet-architecture/eShopOnContainers?path=build/azure-devops/
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
                //κάνουμε αίτημα μέσω του octokit στο repository για να πάρουμε το περιεχόμενο και χρειαζόμαστε τις παραπάνω παραμέτρους
                octokit.repos.getContents({ owner, repo, path}).then(result => {
                    //για κάθε αρχείο που βρίσκουμε φτιάχνουμε το δικό μας json για να έχουμε τα δεδομένα που χρειαζόμαστε
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
                    //επιστρέφουμε το δέντρο
                    res.status("200").send(jsonData);
                    //μορφή δέντρου
                    // {
                    // "owner": "dotnet-architecture",
                    // "repo_name": "eShopOnContainers",
                    // "path": "build/azure-devops/",
                    // "dir_tree": [
                    //     {
                    //     "name": "apigws",
                    //     "path": "build/azure-devops/apigws",
                    //     "url": "https://github.com/dotnet-architecture/eShopOnContainers/tree/dev/build/azure-devops/apigws",
                    //     "type": "dir",
                    //     "conten_url": null,
                    //     "isdir": true
                    //     },
                    //     {...},  
                    // }
                })
                //Αν δεν υπάρχει κάτι στέλνουμε το κατάλληλο μύνημα
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

// GET SEARCH RESULTS
// Αν ο χρήστης θέλει να αναζητήσει κάτι στο git κάνει αίτημα GET με τις παρακάτω μεταβλητές:
// την λέξη που θέλει να αναζητήσει :search
// και ΑΝ θέλει και την γλώσσα :language
//Παράδειγμα:
// http://127.0.0.1:3000/github/eshop/
// ή
// http://127.0.0.1:3000/github/eshop/C#
router.get('/:search/(:language)?', (req, res) => {
    if (req.params.search) {
        q = req.params.search;
        if (req.params.language) {
            q = req.params.search + '+language:' + req.params.language;
        }
        else { q = req.params.search; }
        sort = "stars";
        order = "desc";
        per_page = REPOSITORY_PER_PAGE;
        page = GIT_SEARCH_PAGE
        
        //κάνουμε αίτημα μέσω του octokit στο git για να πάρουμε το περιεχόμενο της αναζήτησης του git για repositories με τα παραπάνω δεδομένα
        octokit.search.repos({ q, sort, order, per_page, page }).then(result => {
            if (parseInt(result.data.total_count) > 0) {
                //αν έχει αποτελέσματα φτιάχνουμε το δικό μας json δέντρο με τα δεδομένα που χρειαζόμαστε
                var viewData = {
                    repos: []
                };
                //για κάθε repository
                result.data.items.forEach(function (reposi) {
                    var jsonData = {};
                    //αποθηκεύουμε τα στοιχεία που χρειαζόμαστε
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
                    //για κάθε αρχικό φάκελο (home folder) 
                    octokit.repos.getContents({ owner, repo, path }).then(result => {
                        if (result.data) {
                            //για κάθε φάκελο-αρχείο αποθηκεύουμε τα στοιχεια που χρειαζόμαστε
                            result.data.forEach(function (file) {
                                var tree_json = {}
                                tree_json["type"] = file.type;
                                tree_json["name"] = file.name;
                                tree_json["path"] = file.path;
                                if (file.type == "dir") {
                                    tree_json["isdir"] = true;
                                    tree_json["conten_url"]=file.download_url;
                                }
                                else {
                                    tree_json["isdir"] = false;
                                    tree_json["conten_url"] = file.download_url;
                                }
                                jsonData["repo_tree_size"] = jsonData["repo_tree"].length;
                                jsonData["repo_tree"].push(tree_json);
                            });


                        }
                    }).catch(error => {
                        //αν υπάρχει πρόβλημα απλά δεν θα υπάρχει δέντρο (πολλές φορές υπερβαίνουμε τα όρια των αιτημάτων )
                        jsonData["repo_tree_size"] = 0;
                    }).then(() => {
                        viewData.repos.push(jsonData)
                        res.send(viewData);
                    });

                });
            }
             //αν δεν βρεθούν αποτελέσματα
            else {
                res.status("200").send({ "code": "200", "message": "No results found" });
            }
        });
        //αν δεν υπάρχει λέξη για αναζήτηση
    } else {
        res.status("400").send({ "code": "400", "message": "link must be, ../SEARCH_KEY_WORD" })
    }
});
module.exports = router;
