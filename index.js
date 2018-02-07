// express
var express = require('express');
var app = express();
app.use(express.static("public"));

// body parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// multer
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });

// mongoose
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/leBonCoin");

// 1) Definir le schema - A faire qu'une fois
var bonCoinSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    offer: String,
    photo: String,
    city: String,
    pseudo: String,
    email: String,
    telephone: String,
    type: String,
});

// 2) Definir le model - A faire qu'une fois
var Annonce = mongoose.model("Annonce", bonCoinSchema);

app.get('/', function (req, res) {
    Annonce.find({}, function(err, prod) {
        res.render('home.ejs', {
            prod : prod,
        });
    });
});

// pages add offers
app.get('/deposer', function (req, res) {
    res.render('annonces.ejs');
});

app.post('/deposer', upload.single("photo"), function (req, res) {
    var title = req.body.title;
    var description = req.body.description;
    var price = req.body.price;
    var offer = req.body.addTypeProd;
    var photo = req.file.filename;
    var city = req.body.city;
    var pseudo = req.body.pseudo;
    var email = req.body.email;
    var telephone = req.body.telephone;
    var type = req.body.addType;

    // 3) Créer des documents
    var prod = new Annonce({
        title: title,
        description: description,
        price: price,
        offer: offer,
        photo: photo,
        city: city,
        pseudo: pseudo,
        email: email,
        telephone: telephone,
        type: type,
    });
    prod.save(function(err, obj) {
        if (!err) {
            res.redirect('/');
        }
    });
});

// page offers by id 
app.get('/annonce/:id', function (req, res) {
    var id = req.params.id;
    Annonce.find({_id: id}, function(err, prod) {
        res.render('annonce_id.ejs', {
            prod : prod[0],
        });
    });
});

// pages modify offers
app.get('/modifier/:id', function (req, res){
    var id = req.params.id;
    Annonce.find({_id: id}, function(err, prod) {
        res.render('modifier.ejs', {
            prod : prod[0],
        });
    });
});
app.post('/modifier/:id', upload.single("photo"), function (req, res) {
    var title = req.body.title;
    var description = req.body.description;
    var price = req.body.price;
    var offer = req.body.addTypeProd;
    var photo = req.file;
    var city = req.body.city;
    var pseudo = req.body.pseudo;
    var email = req.body.email;
    var telephone = req.body.telephone;
    var type = req.body.addType;

    var prodNew = {
        title: title,
        description: description,
        price: price,
        offer: offer,
        city: city,
        pseudo: pseudo,
        email: email,
        telephone: telephone,
        type: type,
    };
    if (photo) {
        prodNew.photo = photo.filename;
    }

    Annonce.findOneAndUpdate({_id: req.params.id}, prodNew, function(err, prod) {
        if (!err){
            res.redirect('/annonce/'+ req.params.id)
        }
    });
      
});

// pages delete offers
app.get('/supprimer/:id', function (req, res) {
    Annonce.deleteOne({ _id: req.params.id }, function (err) {
        if (!err){
            res.redirect("/");
        }
    });
});

// page type offer 
app.get('/offres', function (req, res) {
    var id = req.params.id;
    Annonce.find({offer: "offre"}, function(err, prod) {
        res.render('offers.ejs', {
            prod : prod,
        });
    });
});

// page type demand 
app.get('/demandes', function (req, res) {
    var id = req.params.id;
    Annonce.find({offer: "demande"}, function(err, prod) {
        res.render('demands.ejs', {
            prod : prod,
        });
    });
});
// start
app.listen(3000, function () {
    console.log('Server started');
});