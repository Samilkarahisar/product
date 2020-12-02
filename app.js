require('dotenv').config();
var express = require('express');
var Meta = require('html-metadata-parser');
var morganBody = require('morgan-body');
const path = require("path");
var server= express();
var codes = require("http-status-code");
var bodyParser = require('body-parser');
var cors = require('cors');

const stripe = require('stripe')('sk_test_CR8et9iaTIHqCeyBuZzB5eQA00L8q2lqwy')

morganBody(server);
server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static('public'));
server.use(express.json());

server.set("views", path.join(__dirname, "views"));
server.set("view engine", "pug");

var nodeMailer = require("nodemailer");

const transporter = nodeMailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  auth:{
      pass: "asbusa3411",
      user: "support@producttranslate.com"
  },
  secure: true,
});
transporter.verify(function(error, success) {
  if (error) {
       console.log(error);
  } else {
       console.log('Server is ready to take our messages');
  }
});
var jwt = require("jsonwebtoken");

function generateToken(email){
    const expdate = new Date();
    expdate.setHours(expdate.getHours() + 3);
    return jwt.sign({email: email, expiration: expdate},"secret");
}

server.post('/login', function(req, res) {
const email = req.body.email;
if(!email){
  return res.status(565).send({error:"email is required"});
}
const token = generateToken(email);
var link = "http://localhost:8888/account?token="+token;
var mail = "<p><b>Hi </b></p><br><p>Click the link to login to your Producttranslate dashboard: <a href='"+link+"'>Click here </a></p>";

const mailOptions = {
from: ' "Producttranslate" <support@producttranslate.com>',
html: mail,
subject: "Producttranslate - Login magic link",
to: email,
};
 return transporter.sendMail(mailOptions,error => {
  if(error){
    throw error;
  }
  res.render("login",{message: "Please check your inbox"});
});

});

server.get('/account', function(req, res) {
const token = req.query.token;

let decoded;
try{
decoded = jwt.verify(token,"secret");
}catch{
res.status(403).send({message:"Couldn't verify token."});
}
if(!decoded.hasOwnProperty('email') || !decoded.hasOwnProperty('expiration')){
res.status(403).send({message:"Invalid token"});
}
var email = decoded.email;
var expiration = decoded.expiration;

var now =new Date();

if(expiration < now){
res.status(403).send({message: "Token has expired"});
}
var connection = mysql.createConnection({
  host     : 'localhost',
  port     : '3309',
  database : "producttranslate",
  user     : 'root',
  password : ''
});

var sql = "SELECT * FROM purchases WHERE email= ?";
connection.query(sql, [email], function(err, result, fields) {
  if (err) throw err;
    //newdata.push({website: element.website,languages: element.languages.split("-")})
    var newdata=[];
    for(i=0;i<result.length;i++){
      //console.log(result[i]);
      var lang =  result[i].languages.substr(1,result[i].languages.length);
      var status =  result[i].status.substr(1,result[i].languages.length);
      newdata.push({website: result[i].website,languages: lang.split("-"),status: status.split("-")});
    
    }
  res.render("dashboard",{data: newdata});
});


});

server.get('/login', function(request, response) {
  response.render("login", {message: ""});
});

server.get('/dashboard', function(request, response) {
  response.render("dashboard", { title: "Dashboard" });
});
server.get('/index', function(request, response) {
  response.render("index", { title: "Home" });
});

server.get('/submit', function(request, response) {

 response.render('submit', { language: "" });

});
server.post('/checksite', function(request, response) {
  
  const LanguageDetect = require('languagedetect');
  const lngDetector = new LanguageDetect();
  var url = request.body.weburl;
  var language ="";
  Meta.parser(url, function (err, result) {

  var title = result.meta.title;
  var desc = result.meta.description;

    var testit="";

    if(desc != undefined){
      testit = desc;
    }else{
      testit = title;
    }
  language = lngDetector.detect(testit,1);
  language = language[0][0];
  language = language.charAt(0).toUpperCase() + language.slice(1);
  
  var available = ["English","French", "Spanish", "Turkish", "Arabic", "Russian"]
  available = available.filter(e => e !== language);
  response.render('submit', { language: language, available: available, website: url}); 
  })
 });
 

server.post('/create-checkout-session', async function(req, res) {
  console.log("paz");
  var langs = req.body.bought;
  var languages="";
  console.log(req.body);
  languages = languages + req.body.website;
  langs.forEach(o => {
    languages = languages + "-" + o;
  });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Multilingual translation package',
          },
          unit_amount: 4999,
        },
        quantity: langs.length,
      },
    ],
    metadata: [languages],
    mode: 'payment',
    success_url: 'http://localhost:8888/success',
    cancel_url: 'http://localhost:8888/submit',
  });

  res.json({ id: session.id });

});

var mysql = require('mysql');
const { response } = require('express');

server.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
  let event;

  try {
    console.log(request.body);
    event = request.body;
    console.log(event);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.created':
      var connection = mysql.createConnection({
        host     : 'localhost',
        port     : '3309',
        database : "producttranslate",
        user     : 'root',
        password : ''
      });

      var sql = "INSERT INTO purchases (email,stripe_customer_id,website,languages) VALUES (?)";
      var post = [event.data.object.email,event.data.object.id,"",""];
      console.log(post);
      connection.query(sql, [post], function(err, rows, fields) {
        if (err) throw err;
        console.log("inserted stripe customer and his email");
      });
      break;
    case 'checkout.session.completed':
      const paymentMethod = event.data.object;
      var meta = event.data.object.metadata;
      console.log(meta[0]);
      var split = meta[0].split("-");
      
      var languages = meta[0].replace(split[0],"");

       var connection = mysql.createConnection({
        host     : 'localhost',
        port     : '3309',
        database : "producttranslate",
        user     : 'root',
        password : ''
      });
      var sql = "UPDATE purchases SET website = ?, languages = ? WHERE stripe_customer_id = ? ";
      connection.query(sql, [split[0],languages, event.data.object.customer], function(err, rows, fields) {
        if (err) throw err;
        console.log("updated user info");
      }); 
      //this is where we should insert ther user email and chosen langauges to our database 
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});
server.get('/success', function(request, response) {
  response.render('success', { title: "Success" });
 });

server.get('/charge', function(request, response) {
 response.render('charge', { title: "Charge" });
});
server.listen(8888);
