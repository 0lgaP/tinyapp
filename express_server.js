const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//--------------------------------------------
function generateRandomString() {
  let result = "";
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklonmopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++){
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
}


//--------------------------------------------

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",

};


app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params);
  let allKeys = Object.keys(urlDatabase)
  let shortURL = req.params.shortURL;
  if(!allKeys.includes(shortURL)){
    // res.send("404: We could not find the Tiny URL you are looking for")
    res.redirect("/")

  }
  const templateVars = {shortURL : req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
})


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
})




//----------------------------------------

app.post('/urls', (req, res) => {
  let longURL = req.body.longURL;
  if(!longURL.includes("://")){
    longURL = "http://" + longURL;
  }
  // console.log(req.body);
  let newKey = generateRandomString();
  urlDatabase[newKey] = longURL; 
  res.redirect(`/urls/${newKey}`)
})

//------------------------------------


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});