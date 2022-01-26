const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser());


// Methods --------------------------------------------
function generateRandomString() {
  let result = "";
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklonmopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++){
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
}


// Database --------------------------------------------

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",

};

// Home .... GET /
app.get("/", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]         ///////////////////////////////ADDED STUFF////////////////////////////////////
  };
  // console.log(templateVars)
  res.render("urls_index", templateVars);
});

// New Url ...  GET /urls/new
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]        
  };
  res.render("urls_new", templateVars);
});

// ShortURL ..... GET /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params);
  let allKeys = Object.keys(urlDatabase)
  let shortURL = req.params.shortURL;
  if(!allKeys.includes(shortURL)){
    // res.send("404: We could not find the Tiny URL you are looking for")
    res.redirect("/")

  }
  const templateVars = {
    shortURL : req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]         
  };
  res.render("urls_show", templateVars);
});

// Use new ShortURL ..... GET /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
 const longURL = urlDatabase[req.params.shortURL];
//  console.log(longURL)
 res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// DELETE .....POST /urls/:shortURL/delete

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  console.log(urlToDelete);
  res.redirect("/");
});


// UPDATE ....POST /urls/:shortURL/update

app.post("/urls/:shortURL/update", (req, res) => {
  // console.log("req.params", req.params)
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  // console.log("bodyody", req.body)

  res.redirect("/")


});

//----------------------------------------
// EDIT ....POST /urls
app.post('/urls', (req, res) => {
  let longURL = req.body.longURL;
  if(!longURL.includes("://")){
    longURL = "http://" + longURL;
  }
  // console.log(req.body);
  let newKey = generateRandomString();
  urlDatabase[newKey] = longURL; 
  res.redirect(`/urls/${newKey}`)
});

//------------------------------------
// LOG IN COOKIE......POST /login
app.post("/login", (req, res) => {

  const username = req.body.username;
  res.cookie('username', username)

  res.redirect('/')

});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/')

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});