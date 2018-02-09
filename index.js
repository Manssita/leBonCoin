// express
var express = require('express');
var app = express();
app.use(express.static("public"));
var expressSession = require('express-session');

// body parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// multer
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });

// mongoose
var MongoStore = require('connect-mongo')(expressSession);
var mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/leBonCoin");

var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./models/user');

app.set('view engine', 'ejs');
// Activer la gestion de la session
app.use(expressSession({
    secret: 'secretword',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
  }));
  
  // Activer `passport`
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser()); // JSON.stringify
  passport.deserializeUser(User.deserializeUser()); // JSON.parse

// 1) Definir le schema - A faire qu'une fois
var bonCoinSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    offer: String,
    photo: [],
    city: String,
    pseudo: String,
    email: String,
    telephone: String,
    type: String,
    id_user: String,
});

// 2) Definir le model - A faire qu'une fois
var Annonce = mongoose.model("Annonce", bonCoinSchema);

//add pagination npm mongoose query
var limit = 1;

app.get('/', function (req, res) {
Annonce.count({}, function(err, count){
        Annonce.find({}, function(err, prod) {
            res.render('home.ejs', {
                prod : prod,
                count: count,
            });
        }).limit(limit).skip(req.query.p * limit - limit);
    })
})

// pages add offers
app.get('/deposer', checkUser,  function (req, res) {
    res.render('annonces.ejs');
});

app.post('/deposer', upload.any("photo"), function (req, res) {
    var title = req.body.title;
    var description = req.body.description;
    var price = req.body.price;
    var offer = req.body.addTypeProd;
    var photo = req.files;
    var city = req.body.city;
    var pseudo = req.body.pseudo;
    var email = req.body.email;
    var telephone = req.body.telephone;
    var type = req.body.addType;
    var id_user = req.user._id;
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
        id_user: id_user
    });
    prod.save(function(err, obj) {
        if (!err) {
            res.redirect('/');
        }
    });
});

// page offers by id 
app.get('/annonce/:id', function (req, res, prod) {
    var id = req.params.id;
    Annonce.find({_id: id}, function(err, prod) {
        res.render('annonce_id.ejs', {
            prod : prod[0],
            req : req,
        });
    });
});

// pages modify offers
app.get('/modifier/:id', function (req, res){
    var id = req.params.id;
    Annonce.find({_id: id}, function(err, prod) {
        if (prod[0].id_user == req.user._id){
        res.render('modifier.ejs', {
            prod : prod[0],
        });
    }
    else {
        res.redirect("/");
    }
    });
});

app.post('/modifier/:id', upload.any("photo"), function (req, res) {
    var title = req.body.title;
    var description = req.body.description;
    var price = req.body.price;
    var offer = req.body.addTypeProd;
    var photo = req.files;
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

    Annonce.findOneAndUpdate({_id: req.params.id}, {"$set": prodNew}, {upsert: true}, function(err, prod) {
        if (!err){
            res.redirect('/annonce/'+ req.params.id)
        }
    });
      
});

// pages delete offers
app.get('/supprimer/:id', checkUser, function (req, res) {
    Annonce.deleteOne({ _id: req.params.id, user_id: req.user._id }, function (err) {
        if (!err){
            res.redirect("/");
        }
    });
});

// page type demand 
app.get('/demandes', function (req, res) {
    var response = req.query.who;
    if(!response){
        Annonce.find({offer: "demande"}, function(err, prod) {
            res.render('demands.ejs', {
                prod : prod,
            });
        });
    }
    if(response === "particulier"){
        Annonce.find({offer: "demande", type: "particulier"}, function(err, prod) {
            res.render('demands.ejs', {
                prod : prod,
            });
        });
    }
    if(response === "professionel"){
        Annonce.find({offer: "demande", type: "professionel"}, function(err, prod) {
            res.render('demands.ejs', {
                prod : prod,
            });
        });
    }
});

// page type offer 
app.get('/offres', function (req, res) {
    var response = req.query.who;
    if(!response){
        Annonce.find({offer: "offre"}, function(err, prod) {
            res.render('offers.ejs', {
                prod : prod,
            });
        });
    }
    if(response === "particulier"){
        Annonce.find({offer: "offre", type: "particulier"}, function(err, prod) {
            res.render('offers.ejs', {
                prod : prod,
            });
        });
    }
    if(response === "professionel"){
        Annonce.find({offer: "offre", type: "professionel"}, function(err, prod) {
            res.render('offers.ejs', {
                prod : prod,
            });
        });
    }
});

// authentification
app.get('/account', function(req, res) {
    if (req.isAuthenticated()) {
        var user =req.user;
        Annonce.find({id_user : req.user._id}, function(err, prod) {
            res.render('account', {
                user : user,
                prod : prod,
          });
        });
    } else {
      res.redirect('/');
    }
  });
  
  app.get('/register', function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/account');
    } else {
      res.render('register');
    }
  });
  
  app.post('/register', function(req, res) {
    // Créer un utilisateur, en utilisant le model defini
    // Nous aurons besoin de `req.body.username` et `req.body.password`
    User.register(
      new User({
        username: req.body.username,
        // D'autres champs peuvent être ajoutés ici
      }),
      req.body.password, // password will be hashed
      function(err, user) {
        if (err) {
          console.log(err);
          return res.render('register');
        } else {
          passport.authenticate('local')(req, res, function() {
            res.redirect('/account');
          });
        }
      }
    );
  });
  
  app.get('/login', function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/account');
    } else {
      res.render('login');
    }
  });
  
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/account',
    failureRedirect: '/login'
  }));
  
  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect('/');
  });

//   check si le user est connecté
function checkUser(req, res, next) {
    if (!req.user) {
        res.redirect('/login');
    } else {
        next();    
    }
}
//   check si le user est connecté
function checkUserId (req, res, next, prod) {
    console.log("req",req.user._id)
    // if (req.user._id !== prod.id_user) {
    //     res.redirect('/');
    // } else {
    //     next();    
    // }
}
// app.get('/protected', checkUser, function(req, res) {
// res.render('protected.ejs');
//   });

// start
app.listen(process.env.PORT || 3000, function () {
    console.log('Server started');
});