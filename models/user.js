const mongoose = require('mongoose');
var journeySchema = require('../models/journey')

var userSchema = mongoose.Schema({
    
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  date_insert: Date,
  journeys: [journeySchema],
});

module.exports = mongoose.model('users', userSchema);