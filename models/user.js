const mongoose = require('mongoose');


var userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  date_insert: Date,
  journeysId: [{type : mongoos.Schema.Types.ObjectId, ref : "journeys"}]
});

module.exports = mongoose.model('users', userSchema);