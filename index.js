const express = require("express");
const app= express();
const mongoose = require("mongoose");
const cors = require('cors');
mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', { useNewUrlParser: true });

//ΕΔΩ ΤΟΠΟΘΕΤΟΎΜΕ ΤΟ "PATH" ΑΠΟ ΤΑ ΑΡΧΕΙΑ ΠΟΥ ΘΈΛΟΥΜΕ Ο ΧΡΉΣΤΗΣ ΝΑ ΑΝΑΚΑΤΕΥΘΕΊΝΕΤΑΙ (1)
var users = require('./api/users');
var github = require('./api/github');
var apiscrawler = require('./crawlers/apis.io/apiscrawler');
var pwcrawler = require('./crawlers/pw/pwcrawler');

app.use(express.json());
app.use(cors());

//ΕΔΩ ΕΊΝΑΙ Η ΑΡΧΙΚΉ ΜΑΣ (ΑΝ ΘΕΛΟΥΜΕ ΑΛΛΙΩΣ ΜΠΟΡΕΊ ΕΎΚΟΛΑ ΝΑ ΑΛΛΑΞΕΙ)
app.get('/',(req,res)=>{
    res.send('go on /users or /github or /crawlers/apis or /crawler/pw');
});

// ΕΔΩ ΧΡΗΣΙΜΟΠΟΙΩΝΤΑΣ ΤΟ (1) ΒΆΖΟΥΜΕ ΤΑ ΣΩΣΤΆ PATH ΔΛΔ ΌΤΑΝ Ο ΧΡΉΣΤΗΣ ΧΤΥΠΆΕΙ /ΚΑΤΙ NA ΤΟΥ ΕΜΦΑΝΊΖΕΙ ΤΟ /API/KATI
app.use('/users',users);
app.use('/github',github);
app.use('/crawler/apis',apiscrawler);
app.use('/crawler/pw',pwcrawler);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
 
  module.exports = app;
//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening on port ' + port));
