const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const port = 3000;
const path = require('path');
const mongoose = require("mongoose");
const uri = "mongodb://localhost:27017/email" // uri is the address and port of the server

 
// to connect with the MongoDB server
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true,connectTimeoutMS: 30000,})

.then(() => {
      console.log("Connected to MongoDB");
})
.catch((error) => {
    console.log("MongoDB Connection error", error);
});


// connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDb connection error'));
db.once('open', () => {
  console.log("Connected to MongoDB");
});

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.urlencoded({extended: false}));
 
// define the schema
const subscriberSchema = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      required: true,
    },
  });

const Subscriber = mongoose.model('Subscriber',subscriberSchema);

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, 'public/home.html'));
});

app.post("/", function(req, res){

 const email = req.body.email;
 
 try{

  // checking if the subscriber/email already exists using findOne method
  (async() => {
    const existingSubscriber = await Subscriber.find({ email: email }).limit(1);

  if(existingSubscriber){
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

app.use(express.static('public'));

app.listen(port, function(req, res){
    console.log("Server is listening on port 3000");
});