
const mongoose = require("mongoose");

const ServiceSeekerSchema = new mongoose.Schema({
  name: String,
  bio: String,
  skills: [String],
  experience: String,
  location: String,
});

module.exports = mongoose.model("ServiceSeeker", ServiceSeekerSchema);
