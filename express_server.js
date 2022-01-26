const express = require("express");
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));


// METHODS ...........................................
function generateRandomString() {
  let result = "";
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklonmopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++){
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
}
function findByEmail(email) {
  //if we find user, return user
  //if not, return null
  for (const userID in users) {
    const user = users[userID];
    if(user.email === email){
      return user;
    }
  }
  return null;
};

// URL Database ...........................................
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",

};

// User Database ..........................................
const users = {
  'trogdor': {
    id: 'trogdor',
    email: 'trog@gmail.com',
    password: '1234',
  }
}

// GET Home ............................................
app.get("/", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]        ///////////////////////////////ADDED STUFF////////////////////////////////////
  };
  // console.log(templateVars.user_id)
  res.render("urls_index", templateVars);
});

// GET /urls/new .......................................
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] 
           
  };
  console.log(templateVars.user)
  res.render("urls_new", templateVars);
});

// GET /urls/:shortURL .................................
app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params);
  let allKeys = Object.keys(urlDatabase)
  let shortURL = req.params.shortURL;
  if(!allKeys.includes(shortURL)){
    // res.send("404: We could not find the Tiny URL you are looking for")
    return res.redirect("/urls_404");
  }
  const templateVars = {
    shortURL : req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]         
  };
  res.render("urls_show", templateVars);
});

// GET urls_404 ........................................
app.get("/urls_404", (req, res) => {
  const templateVars = {
    shortURL : req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
    message: "Tiny URL requested does not exist. BAM!"        
  };

  res.render("urls_404", templateVars)
})

// GET urls_400 ........................................
app.get("/urls_400", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    message: "Bad Equest"        
  };

  res.render("urls_400", templateVars)
})

// GET /u/:shortURL ....................................
app.get("/u/:shortURL", (req, res) => {
 const longURL = urlDatabase[req.params.shortURL];
//  console.log(longURL)
 res.redirect(longURL);
});

// GET /urls.json ........................................
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// DELETE .....POST /urls/:shortURL/delete ...............
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  console.log(urlToDelete);
  res.redirect("/");
});

// UPDATE ....POST /urls/:shortURL/update ................
app.post("/urls/:shortURL/update", (req, res) => {
  // console.log("req.params", req.params)
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  // console.log("bodyody", req.body)

  res.redirect("/")


});

// EDIT ....POST /urls ...................................
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

// LOG IN GET..............................................
app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars)
})

// LOG IN POST.......... /login ..........................
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //check if we are not missing either name or email
  if(!email || !password){
    const templateVars = {
      user: users[req.cookies["user_id"]],
      message: "Missing your email and/or password" 
    }
    return res.render("./urls_400", templateVars)
  }

  //find user based on email
  const user = findByEmail(email);

  //user not found
  if(!user) {
    const templateVars = {
      user: users[req.cookies["user_id"]],
      message: "No user with this email was found :'(" 
    }
    return res.render("./urls_403", templateVars)
  }

  //found user, does the password match?
  if(user.password !== password) {
    const templateVars = {
      user: users[req.cookies["user_id"]],
      message: "Is your caps lock on? Because that's not your password... fool..." 
    }
    return res.render("./urls_403", templateVars)
  }

  //happy path
  res.cookie('user_id', user.id);

  res.redirect("/")

})


// LOG OUT ..........POST /logout ........................
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/')

});

// REGISTER ..............................................
// GET REGISTER .......................
app.get("/register", (req, res) =>{
  const templateVars = {
    user: users[req.cookies["user_id"]],
    
  }
  // console.log(req.cookies["user_id"])
  res.render("urls_register", templateVars)
})

// POST REGISTER ......................
app.post("/register", (req, res) => {
  const email = req.body.email;
  // console.log(req.body)
  const password = req.body.password;
  
  //check if we are not missing either name or email
  if(!email || !password){
    const templateVars = {
      user: users[req.cookies["user_id"]],
      message: "Missing your email and/or password" 
    }
    return res.render("./urls_400", templateVars)
  }

  //find out if email is already registered
  const user = findByEmail(email);
  if(user) {
    const templateVars = {
      user: users[req.cookies["user_id"]],
      message: "Your email is already signed up!" 
    }

    return res.render('./urls_400', templateVars)
  }

  //add the new user to our users object
  const id = generateRandomString();
  const user_id = res.cookie('user_id', id)

  users[id] = {
    id,
    email,
    password,

  }
console.log(id)


  console.log(users[id])
  res.redirect('/')   

})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});