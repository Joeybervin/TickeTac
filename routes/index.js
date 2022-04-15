var express = require('express');
var router = express.Router();

/* My models */
var journeyModel = require('../models/journey')
var userModel = require('../models/user')

/* Construction de ma database */
var city = ["Paris","Marseille","Nantes","Lyon","Rennes","Melun","Bordeaux","Lille"]
var date = ["2018-11-20","2018-11-21","2018-11-22","2018-11-23","2018-11-24"]

/* Fonctions */
function total(list) {
  var total = 0;
  var nbrTickets = 0;

  for (var i = 0; i < list.length; i++) {
    nbrTickets += Number(list[i].quantity)
    total += (list[i].quantity * list[i].price)
  }


  return {total, nbrTickets}

}

/* GET home page. */
router.get('/', function(req, res, next) {
  var alreadyMember = false;
  var newUser = false;
  var user = null;
  res.render('index', { title: 'TickeTac', alreadyMember, newUser, user });
});


// ======================================== USER CONNEXION PART  ========================================

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

    res.render('index', { title: 'TickeTac', newUser, alreadyMember, user: req.session.user });
  }

  
});

// LOG OUT
//
router.get('/logout', function(req, res, next) {
  req.session.user = null
  res.redirect('/');
});

// ======================================== JOURNEYS SEARCH PART  ========================================

// ----------------- SEARCH PAGE
// HOMEPAGE
//
router.get('/homepage',async  function(req, res, next) {
  if (req.session.user === null) {
    res.redirect('/')
  }else {
    var user = req.session.user
    if (req.session.ticketsCard == undefined) {
      req.session.ticketsCard =  []
    }
  }

  

  /* total */
  var totalCard = total(req.session.ticketsCard)
  

  res.render('homepage', { title: 'TickeTac', user, ticketsCard : req.session.ticketsCard, nbrTickets: totalCard.nbrTickets });
});

// ----------------- SUCCESSFUL SEARCH
// JOURNEYS PAGE
//
router.post('/journeyspage',async function(req, res, next) {

  var ticketDate = req.body.date

  /* Je cherche le ticket que le user veut */
  var journeysFound = await journeyModel.find({
    departure : req.body.departure,
    arrival : req.body.arrival,
    date : req.body.date
  })

  /* Si aucun ticket n'est trouvé =====> Nous redirigeons le user vers une page d'erreur */

    if (journeysFound.length == 0 || journeysFound == null) {
      res.redirect('searchError')
    }
  //du plus petit prix dans l'ordre croissant 
  journeysFound.sort((a,b) => Number(a.price) - Number(b.price));

  var totalCard = total(req.session.ticketsCard)

  res.render('journeyspage', { title: 'TickeTac', user: req.session.user, ticketDate , journeysFound, nbrTickets : totalCard.nbrTickets});
});

// ----------------- UNSUCCESSFUL SEARCH
// SEARCH ERROR
//
 router.get('/searchError', function(req, res, next) {
  res.render('searchError', { title: 'TickeTac', user: req.session.user , ticketsCard : req.session.ticketsCard });
}); 


// ======================================== USER CART PART ========================================

// MY CARD
//
router.get('/card', function(req, res, next) {
  var ticketsCard = req.session.ticketsCard
  

  /* total */
  var totalCard = total(ticketsCard)


  res.render('card', { title: 'TickeTac', user: req.session.user, ticketsCard, totalCard : totalCard.total , nbrTickets : totalCard.nbrTickets  });
});

// MY CARD
//
router.post('/add-ticket', async function(req, res, next) {

  /* Je créer une session ppur mon panier */
  if (req.session.ticketsCard == undefined) {
    req.session.ticketsCard = []
  }

  var ticketsCard = req.session.ticketsCard
  var doublon = false

  /* Ajout produit au panier */
  var productId = req.query.ticketId;
  var journeyChoose = await journeyModel.findById(productId)

  /* Vérifions si le même ticket n'a pas déjà été ajouté */
  for (var i = 0; i < ticketsCard.length; i++) {
    
    if (ticketsCard[i].id == journeyChoose._id) {
      ticketsCard[i].qauntity += req.body.quantity
      console.log("ici 1")
      console.log(ticketsCard[i].id)
      console.log(journeyChoose.id)
      var doublon = true
    }

  }

  if (!doublon && productId) {
    console.log('ici 2')
    ticketsCard.push({
      id : journeyChoose.id,
      departure: journeyChoose.departure,
      arrival: journeyChoose.arrival,
      date: new Date(journeyChoose.date),
      departureTime: journeyChoose.departureTime,
      price: journeyChoose.price,
      quantity: req.body.quantity
    })
    
  }

  /* Total */
  var totalCard = total(ticketsCard)

  res.render('homepage', { title: 'TickeTac', user: req.session.user , ticketsCard : req.session.ticketsCard, totalCard : totalCard.total , nbrTickets : totalCard.nbrTickets});
});

// MY CARD
//
router.get('/delete-ticket', function(req, res, next) {
  var ticketsCard = req.session.ticketsCard

  ticketsCard.splice(req.query.ticketId,1)

  /* Total */
  var totalCard =  total(ticketsCard)

  res.render('card', { title: 'TickeTac', user: req.session.user, ticketsCard, totalCard : totalCard.total , nbrTickets : totalCard.nbrTickets  });
});

// MY CARD
//
router.post('/update-ticket', function(req, res, next) {
  var ticketsCard = req.session.ticketsCard

  /* J'update la quantité en récupérant : req.body.indice et req.body.quantity */
  ticketsCard[Number(req.body.indice)].quantity = req.body.quantity

  /* Total */
  var totalCard = total(ticketsCard)
  console.log(ticketsCard)

  res.render('card', { title: 'TickeTac', user: req.session.user, ticketsCard, totalCard : totalCard.total , nbrTickets : totalCard.nbrTickets  });
});


// ======================================== USER DATAS PART ========================================

// ADD TO USER DATAS
//
router.post('/add-to-user-datas', async function(req, res, next) {
  var ticketsCard = req.session.ticketsCard


/* J'ajoute mon panier à mon user */
  for (var i = 0; i < ticketsCard.length; i++) {
    await userModel.updateOne(
      { _id : req.session.user.id },
      {$push : {journeysId : ticketsCard[i].id}}
      );

  }

  /* Je vide le panier */
  ticketsCard.splice(0, ticketsCard.length)

  /* total */
  var totalCard = total(req.session.user)

  res.render('card', { title: 'TickeTac', user: req.session.user, ticketsCard, totalCard : totalCard.total , nbrTickets : totalCard.nbrTickets  });
});

// MY LAST TRIP
//
router.get('/mylasttrip', async function(req, res, next) {
  /* Ma session */
  var user = req.session.user

  /* Je vais chercher tous les trajets de mon user */
  var userJourneys = await userModel.findById(user.id).populate('journeysId').exec()

  /* Function total ===> mais pour récupérer le nombre d'articles dans le panier */
  var totalCard = total(req.session.ticketsCard)
  console.log(userJourneys.journeysId)

  res.render('mylasttrip', { title: 'TickeTac', user , userJourneys, nbrTickets : totalCard.nbrTickets });
});


// ======================================== CREATION DATABASE PART ========================================

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
