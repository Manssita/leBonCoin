var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });
app.use(express.static("public"));

var offers= [];

app.get('/', function (req, res) {
    res.render('home.ejs', {
        object: offers,
    });
});

app.get('/deposer', function (req, res) {
    res.render('annonces.ejs');
});

app.post('/deposer', upload.single("photo"), function (req, res) {
    console.log(req.file);
    var offer = {};
    offer.title = req.body.title;
    offer.description = req.body.description;
    offer.price = req.body.price;
    offer.photo = req.file.filename;
    offer.city = req.body.city;
    offer.pseudo = req.body.pseudo;
    offer.email = req.body.email;
    offer.telephone = req.body.telephone;
    offers.push(offer);
    res.redirect('/');
});

app.listen(3000, function () {
    console.log('Server started');
});