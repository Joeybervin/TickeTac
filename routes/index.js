var express = require('express');
var router = express.Router();

/* My models */
var journeyModel = require('../models/journey')
var userModel = require('../models/user')


var city = ["Paris","Marseille","Nantes","Lyon","Rennes","Melun","Bordeaux","Lille"]
var date = ["2018-11-20","2018-11-21","2018-11-22","2018-11-23","2018-11-24"]


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'TickeTac' });
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

router.get('/homepage', function(req, res, next) {
  res.render('homepage', { title: 'TickeTac' });
});

router.get('/journeyspage', function(req, res, next) {
  res.render('journeyspage', { title: 'TickeTac' });
});

router.get('/mylasttrip', function(req, res, next) {
  res.render('mylasttrip', { title: 'TickeTac' });
});

router.get('/searchError', function(req, res, next) {
  res.render('searchError', { title: 'TickeTac' });
});

router.get('/card', function(req, res, next) {
  res.render('card', { title: 'TickeTac' });
});


module.exports = router;
