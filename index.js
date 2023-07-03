const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const port = 3000;
const path = require('path');
const mongoose = require("mongoose");
const uri = "mongodb://localhost:27017/emaildb"

 
// to connect to the mongodb server
mongoose.connect(uri,{ // uri is address and port of server
useNewUrlParser: true, 
useUnifiedTopology: true,
connectTimeoutMS: 30000,
});


// Database name: emaildb

app.use(bodyparser.json());
app.use(express.static('public'));

// connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDb connection error'));
db.once('open', () => {
  console.log("Connected to MongoDB");
});
 
// Importing the Subscriber model from models.js file
const Subscriber = require('./models');

app.listen(port, function(req, res){
    console.log("Server is listening on port 3000");
});

// Subscribe
app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, 'public/home.html'));
});

// To handle the post requests
app.post("/", function(req, res){
 // processing of data
 const email = req.body.email;

 try{

  // checking if the subscriber/email already exists using findOne method
  (async() => {
    const existingSubsciber = await Subscriber.findOne({email}).maxTimeMS(20000)

  if(existingSubsciber){
    return res.status(400).json({message: 'Email already subscribed!'});
  }

  // new subscriber subscribed and saving it to the database
  const newSubscriber = new Subscriber({email});
  await newSubscriber.save();
  
  // response sent that subscribed successfully
  res.json({message: "Successfully subscribed for newsletter"});
})();
 }
 catch(err){
    console.log("Database error", err);
    res.status(500).json({message: 'An error occured'});
 }
});





