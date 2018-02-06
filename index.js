var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });
app.use(express.static("public"));
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/leBonCoin");

// 1) Definir le schema - A faire qu'une fois
var bonCoinSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    photo: String,
    city: String,
    pseudo: String,
    email: String,
    telephone: String,
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

app.get('/deposer', function (req, res) {
    res.render('annonces.ejs');
});

app.post('/deposer', upload.single("photo"), function (req, res) {
    var title = req.body.title;
    var description = req.body.description;
    var price = req.body.price;
    var photo = req.file.filename;
    var city = req.body.city;
    var pseudo = req.body.pseudo;
    var email = req.body.email;
    var telephone = req.body.telephone;

    // 3) Créer des documents
    var prod = new Annonce({
        title: title,
        description: description,
        price: price,
        photo: photo,
        city: city,
        pseudo: pseudo,
        email: email,
        telephone: telephone,
    });
    prod.save(function(err, obj) {
        if (!err) {
            res.redirect('/');
        }
    });
});

app.get('/annonce/:id', function (req, res) {
    var id = req.params.id;
    Annonce.find({}, function(err, prod) {
        res.render('annonce_id.ejs', {
            prod : prod[0],
        });
    });
});

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
    var photo = req.file;
    var city = req.body.city;
    var pseudo = req.body.pseudo;
    var email = req.body.email;
    var telephone = req.body.telephone;

    var prodNew = {
        title: title,
        description: description,
        price: price,
        city: city,
        pseudo: pseudo,
        email: email,
        telephone: telephone,
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

app.listen(3000, function () {
    console.log('Server started');
});