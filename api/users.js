const Joi = require('joi'); //ΤΟ ΧΡΗΣΙΜΟΠΟΙΟΥΜΕ ΓΙΑ ΤΟ VALIDATION
const User = require('../mongo-models/user-model');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
});

// router.get('/',(req,res)=>{
//     res.send('hello Users!!!')
// });

//---------------------------------GET--------------------------------
router.get('/', (req, res) => {
    User.find()
        .select()
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                users: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        surname: doc.surname,
                        email: doc.email,
                        password: doc.password
                    }
                })
            };
            res.status(200).json(response);
        })
});

//-----------------------------------POST------------------------------
router.post('/register', (req, res) => {
    //req.headers("Access-Control-Allow-Origin: *");
    //res.setHeader('Access-Control-Allow-Origin', '*');
    console.log(req.body);

    const result = validateUser(req.body); // Καλούμε την validateUser για να κάνουμε validate την είσοδο που παίρνουμε
    // ΑΝ ΤΟ ΠΟΤΕΛΕΣΜΑ ΕΧΕΙ ERROR ΤΟΤΕ ΕΠΙΣΤΡΕΦΟΥΜΕ 400
    if (result.error) return res.status(400).send({
        success: 'false',
        message: result.error.details[0].message
    });

    checkUser(req.body.email).then((userExists) => {
        console.log(userExists);
        if (userExists) return res.status(401).send({
            success: 'false',
            message: `user with email ${req.body.email} exists`
        });

    }, function () {
        console.log("error");
    })

    bcrypt.hash(req.body.password, 10, function (err, hash) { //Χρησημοποιούμε την bcrypt.hash για να χασάρουμε τον κωδικό του χρήστη και μέσα σε αυτήν βάζουμε το αντικείμενο user στην βάση

        const user = new User({ // Δημιουργούμε ένα νέο αντικείμενο User το οποίο θα μπει στην βάση και του δίνουμε τις τιμές από το request του client και το objectId που δημιουργεί αυτόματα η mongoose
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: hash
        });

        user // Κάνουμε save για να αποθηκευτεί στη βάση και μετά επιστρέφουμε κατάλληλο μήνυμα αν όλα πήγαν καλά και αντίστοιχα αν προέκυψε σφάλμα
            .save()
            .then(result => {
                // Δημιουργούμε ένα token με βάση το email του χρήστη για να μπορέσουμε να τον αυθεντικοποιήσουμε από το front end 
                let payload = {
                    subject: result.email
                };
                let token = jwt.sign(payload, 'secretKey');

                console.log(result);
                res.status(200).json({
                    success: 'true',
                    message: 'User created successfully',
                    createdUser: result,
                    token: {
                        token
                    }
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    success: 'false',
                    message: err
                });
            });

    });


});

//-----------------------------------POST LOGIN------------------------------
router.post('/login', (req, res) => {

    const result = validateUserLogin(req.body); // Καλούμε την validateUserLogin για να κάνουμε validate την είσοδο που παίρνουμε
    // ΑΝ ΤΟ ΠΟΤΕΛΕΣΜΑ ΕΧΕΙ ERROR ΤΟΤΕ ΕΠΙΣΤΡΕΦΟΥΜΕ 400
    if (result.error) return res.status(400).send({
        success: 'false',
        message: result.error.details[0].message
    });

    checkUser(req.body.email).then((userExists) => {
        if (userExists) {
            // bcrypt.hash(req.body.password, 10, function (err, hash) {
            checkPassword(req.body.email, req.body.password)
                .then((correctPassword) => {
                    console.log(correctPassword);
                    if (!correctPassword) {
                        return res.status(400).send({
                            success: 'false',
                            message: "incorrect password"
                        });
                    } else {
                        // Δημιουργούμε ένα token με βάση το email του χρήστη για να μπορέσουμε να τον αυθεντικοποιήσουμε από το front end 
                        let payload = {subject: req.body.email};
                        let token = jwt.sign(payload, 'secretKey');
                        return res.status(200).send({
                            success: 'true',
                            message: correctPassword,
                            token : token,
                            email: req.body.email
                        });
                    }
                })
            // });
        } else {
            return res.status(401).send({
                success: 'false',
                message: `user with email ${req.body.email} doesn't exists`
            });
        }
    });

});

function validateUserLogin(user) {
    // ΔΗΜΙΟΥΡΓΟΥΜΕ ΕΝΑ ΠΡΟΤΥΠΟ ΓΙΑ ΤΟ ΠΩΣ ΘΕΛΟΥΜΕ ΝΑ ΕΙΝΑΙ ΤΑ ΔΕΔΟΜΕΝΑ ΠΟΥ ΘΑ ΠΑΡΟΥΜΕ
    const schema = {
        // ΓΙΑ ΠΑΡΑΔΕΙΓΜΑ ΤΟ NAME ΠΡΕΠΕΙ ΝΑ ΕΧΕΙ ΤΟ ΛΙΓΟΤΕΡΟ 3 ΓΡΑΜΜΑΤΑ ΚΑΙ ΕΙΝΑΙ ΥΠΟΧΡΕΩΤΙΚΟ
        email: Joi.string().email().required(),
        password: Joi.string().min(3).required(),
    };
    // ΕΛΕΓΧΟΥΜΕ ΤΑ ΔΕΔΟΜΕΝΑ ΠΟΥ ΠΑΙΡΝΟΥΜΕ ΜΕ ΤΟ ΠΡΟΤΥΠΟ(SCHEMA)
    return Joi.validate(user, schema);
}

function checkPassword(user_email, user_password) {

    return User.find({
            email: user_email,
        }).select()
        .exec()
        .then(
            docs => {

                const response = {
                    count: docs.length,
                    users: docs.map(doc => {
                        return {
                            _id: doc._id,
                            name: doc.name,
                            surname: doc.surname,
                            email: doc.email,
                            password: doc.password
                        }
                    })
                };
                try {
                    var result = bcrypt.compareSync(user_password, response.users[0].password);
                } catch (error) {
                    console.log(error);
                }
                if (result) {
                    console.log(result);
                    return response.users[0];
                } else {
                    return false;
                }
            })

}



function validateUser(user) {
    // ΔΗΜΙΟΥΡΓΟΥΜΕ ΕΝΑ ΠΡΟΤΥΠΟ ΓΙΑ ΤΟ ΠΩΣ ΘΕΛΟΥΜΕ ΝΑ ΕΙΝΑΙ ΤΑ ΔΕΔΟΜΕΝΑ ΠΟΥ ΘΑ ΠΑΡΟΥΜΕ
    const schema = {
        // ΓΙΑ ΠΑΡΑΔΕΙΓΜΑ ΤΟ NAME ΠΡΕΠΕΙ ΝΑ ΕΧΕΙ ΤΟ ΛΙΓΟΤΕΡΟ 3 ΓΡΑΜΜΑΤΑ ΚΑΙ ΕΙΝΑΙ ΥΠΟΧΡΕΩΤΙΚΟ
        name: Joi.string().min(3).required(),
        surname: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(3).required(),
    };
    // ΕΛΕΓΧΟΥΜΕ ΤΑ ΔΕΔΟΜΕΝΑ ΠΟΥ ΠΑΙΡΝΟΥΜΕ ΜΕ ΤΟ ΠΡΟΤΥΠΟ(SCHEMA)
    return Joi.validate(user, schema);
}

function checkUser(user_email) {

    return User.findOne({
        email: user_email
    }).then(docs => {
        if (docs) {
            console.log("iparxei");
            return true;
        } else {
            console.log("dn iparxei");
            return false;
        }
    });
}


// --------------------------------- POST VERIFY ---------------------------------------
router.post('/verify', (req, res) => {
    if(req.body.token)
    {
        let payload = jwt.verify(req.body.token, 'secretKey');
        if(!payload) {
        return res.status(401).send({
            success: 'false',
            message: `Unauthorized request`
        });       
        }else{
            return res.status(200).send({
                success: 'true',
                message: `Token ${req.body.token} verified successfully`
            }); 
        }
    }
    else{
        return res.status(400).send({
            success: 'false',
            message: `Token is needed`
        });
    }
    
    

})

// -------------------------------------- DELETE --------------------------------
router.delete('/:email', (req, res) => {
const email = req.params.email ;
//console.log(email);
User
    .findOneAndDelete({
    email: req.params.email,
})
    .then( docs => {
        if (docs)
        res.send({success: "true",message: `user with email: ${email} succesfully deleted`});
        else
        res.send({success: "false",message: `user with email: ${email} doesn't exists`});
    
    })

});



module.exports = router;