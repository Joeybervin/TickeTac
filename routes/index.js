var express = require('express');
var router = express.Router();

/* My models */
var journeyModel = require('../models/journey')
var userModel = require('../models/user')


var city = ["Paris","Marseille","Nantes","Lyon","Rennes","Melun","Bordeaux","Lille"]
var date = ["2018-11-20","2018-11-21","2018-11-22","2018-11-23","2018-11-24"]


/* GET home page. */
router.get('/', function(req, res, next) {
  var alreadyMember = false;
  var newUser = false;
  var user = null;
  res.render('index', { title: 'TickeTac', alreadyMember, newUser, user });
});


// ===================================================== USER CONNEXION PART  =====================================================

// SIGN UP
// 
router.post('/signUp', async function(req, res, next) {
  var alreadyMember = false;

  /* Véfificaton si le compte éxiste déjà */
  var account = await userModel.findOne({ email: req.session.email });

  // __________________________ SUCCESS  __________________________
  /* Ajout de l'utilisateur à la base de données */
  if (account == null) {
    var newUser = new userModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      date_insert: new Date(),
    })


    /* J'enregistre dans la base de données */
    var newUserSaved = await newUser.save()

    /* Je créer une session utilisateur avec les données entrée*/
    req.session.user = {
      email: newUserSaved.email,
      firstName: newUserSaved.firstName,
      id : newUserSaved._id,
    }

    /* Redirige l'utilisateur vers la homepage */
    res.redirect('homepage')
  }

  // __________________________ ECHEC  __________________________
   /* Pour renvoyé un message d'erreur */
  else {
    /* Affichage message erreur */
    alreadyMember = true

  }




  res.render('index', { title: 'TickeTac', alreadyMember });
});

// SIGN IN
//
router.post('/signIn', async function(req, res, next) {

  var newUser, alreadyMember = false;

  /* Vérifications si le compte existe */
  var account = await userModel.findOne({
    email: req.body.email,
    password: req.body.password });

  // __________________________ SUCCESS  __________________________
  if (account !== null) {
    req.session.user = {
      email: account.email,
      firstName: account.firstName,
      id : account._id,
    }
    res.redirect('/homepage')
  }
  // __________________________ ECHEC  __________________________
  else {
    /* Affichage message erreur */
    newUser = true

    res.render('index', { title: 'TickeTac', newUser, alreadyMember });
  }

  
});

// LOG OUT
//
router.get('/logout', function(req, res, next) {
  req.session.user = null
  res.redirect('/');
});

// ===================================================================================================================================

// HOMEPAGE
//
router.get('/homepage',async  function(req, res, next) {
  if (req.session.user === null) {
    res.redirect('/')
  }else {
    var user = req.session.user
  }

  res.render('homepage', { title: 'TickeTac', user });
});

// JOURNEYS PAGE
//
router.post('/journeyspage', async function(req, res, next) {
   // Recherche de trajet à une date précise
   var departureExist = await journeyModel.find({ departure: req.body.departure });
   var arrivalExist = await journeyModel.find({ arrival: req.body.destination });
   var dateExist = await journeyModel.find({ departureTime: req.body.departureTime });
     /* Si aucun train disponible pour la date sélectionnée => affichage page erreur */
   if (dateExist == null) {
     res.redirect('/searchError')
     /* Si un ou plusieurs trajets possibles pour la date sélectionnée => affichage page trajets possibles */
   }else if (dateExist && departureExist && arrivalExist){
     res.redirect('/journeyspage')
   };
  res.render('journeyspage', { title: 'TickeTac', dateExist, departureExist, arrivalExist });
});

// MY LAST TRIP
//
router.get('/mylasttrip', async function(req, res, next) {
  /* Ma session */
  var user = req.session.user

  /* Je vais chercher tous les trajets de mon user */
  var userJourneys = await userModel.findById(user.id).populate('journeysId').exec()

  res.render('mylasttrip', { title: 'TickeTac', user , userJourneys });
});

router.get('/searchError', function(req, res, next) {
  res.render('searchError', { title: 'TickeTac' });
});

router.get('/card', function(req, res, next) {
  res.render('card', { title: 'TickeTac' });
});


// Remplissage de la base de donnée, une fois suffit
router.get('/save', async function(req, res, next) {

  // How many journeys we want
  var count = 300

  // Save  ---------------------------------------------------
    for(var i = 0; i< count; i++){

    departureCity = city[Math.floor(Math.random() * Math.floor(city.length))]
    arrivalCity = city[Math.floor(Math.random() * Math.floor(city.length))]

    if(departureCity != arrivalCity){

      var newUser = new journeyModel ({
        departure: departureCity , 
        arrival: arrivalCity, 
        date: date[Math.floor(Math.random() * Math.floor(date.length))],
        departureTime:Math.floor(Math.random() * Math.floor(23)) + ":00",
        price: Math.floor(Math.random() * Math.floor(125)) + 25,
      });
       
       await newUser.save();

    }

  }
  res.render('index', { title: 'Express' });
});

module.exports = router;
