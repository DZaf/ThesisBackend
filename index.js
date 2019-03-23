const express = require("express");
const app= express();
const mongoose = require("mongoose");
mongoose.connect('mongodb+srv://admin:admin@thesis-cluster-9doea.mongodb.net/test?retryWrites=true', { useNewUrlParser: true });

//ΕΔΩ ΤΟΠΟΘΕΤΟΎΜΕ ΤΟ "PATH" ΑΠΟ ΤΑ ΑΡΧΕΙΑ ΠΟΥ ΘΈΛΟΥΜΕ Ο ΧΡΉΣΤΗΣ ΝΑ ΑΝΑΚΑΤΕΥΘΕΊΝΕΤΑΙ (1)
var users = require('./api/users');
var github = require('./api/github');

app.use(express.json());

//ΕΔΩ ΕΊΝΑΙ Η ΑΡΧΙΚΉ ΜΑΣ (ΑΝ ΘΕΛΟΥΜΕ ΑΛΛΙΩΣ ΜΠΟΡΕΊ ΕΎΚΟΛΑ ΝΑ ΑΛΛΑΞΕΙ)
app.get('/',(req,res)=>{
    res.send('hello world!!');
});

// ΕΔΩ ΧΡΗΣΙΜΟΠΟΙΩΝΤΑΣ ΤΟ (1) ΒΆΖΟΥΜΕ ΤΑ ΣΩΣΤΆ PATH ΔΛΔ ΌΤΑΝ Ο ΧΡΉΣΤΗΣ ΧΤΥΠΆΕΙ /ΚΑΤΙ NA ΤΟΥ ΕΜΦΑΝΊΖΕΙ ΤΟ /API/KATI
app.use('/users',users);
app.use('/github',github);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
 
  module.exports = app;
app.listen(3000, ()=>console.log("listening on port 3000"));