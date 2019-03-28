const Joi = require('joi'); //ΤΟ ΧΡΗΣΙΜΟΠΟΙΟΥΜΕ ΓΙΑ ΤΟ VALIDATION
const User = require('../mongo-models/user-model');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

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
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log(req.body);

    const result = validateUser(req.body); // Καλούμε την validateUser για να κάνουμε validate την είσοδο που παίρνουμε
    // ΑΝ ΤΟ ΠΟΤΕΛΕΣΜΑ ΕΧΕΙ ERROR ΤΟΤΕ ΕΠΙΣΤΡΕΦΟΥΜΕ 400
    if (result.error) return res.status(400).send({
        success: 'false',
        message: result.error.details[0].message
    });

    if (checkUser(req.body.email)){
        console.log("user exists");
        return res.status(401).json({
        success: 'false',
        message: `user with email ${req.body.email} exists`
    });
}

    const user = new User({ // Δημιουργούμε ένα νέο αντικείμενο User το οποίο θα μπει στην βάση και του δίνουμε τις τιμές από το request του client και το objectId που δημιουργεί αυτόματα η mongoose
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        password: req.body.password
    });

    user // Κάνουμε save για να αποθηκευτεί στη βάση και μετά επιστρέφουμε κατάλληλο μήνυμα αν όλα πήγαν καλά και αντίστοιχα αν προέκυψε σφάλμα
        .save()
        .then(result => {

            console.log(result);
            res.status(200).json({
                success: 'true',
                message: 'User created successfully',
                createdUser: result
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
    User.findOne({
        email: user_email
    }, function (err, user) {
        if (err) {
            console.log(err);
        }
        if (user) {
            return true;
        } else {
            return false;
        }
    });
}
module.exports = router;