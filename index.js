require('dotenv').config();
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const { render } = require("ejs");
const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 3306;

app.listen(port, function(req, res) {
  console.log("Server is listening on port 3000");
});

// connection to the database
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Connected');
    // Start the server after successful MongoDB connection
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error);
  });

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const subscriberSchema = new mongoose.Schema({
  email:{
      type: String,
      required: true
  }
});

const Subscriber = new mongoose.model('Subscriber', subscriberSchema);

app.get("/", function(req, res){
  res.render("index.ejs");
})

app.post("/", async (req, res) => {
  const email = req.body.email;
  console.log(email);
 try {
    // Checking if the subscriber/email already exists using findOne method
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber === null) {
      // Subscriber does not exist
      const newSubscriber = new Subscriber({ email });
      await newSubscriber.save();
      res.render("success.ejs");
    } else {
      // Subscriber exists
      res.render("exists.ejs");
    }
    
  } catch (err) {
    console.log("Database error", err);
    res.status(500).json({ message: 'An error occurred' });
  }
});

