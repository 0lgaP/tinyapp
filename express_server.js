// REQUIRE LIST.......................................
const express = require("express");
const morgan = require('morgan');
const uuid = require('uuid/v4');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs'); 
const salt = bcrypt.genSaltSync(10);
const app = express();

// DEFAULT PORT........................................
const PORT = 8080; 

// SET EJS.............................................
app.set("view engine", "ejs");

//APP.USE..............................................
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['GAdUaLCToRscfJz7g2ZU', 'zAmLNGvWbr89hOqBsL4q']
}));
// morgan middleware allows to log the request in the terminal
app.use(morgan('short'));
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// Static assets (images, css files) are being served from the public folder
app.use(express.static('public'));

// METHODS ..............................................
function generateRandomString() {
  let result = "";
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklonmopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++){
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
}
function findByEmail(email, database) {
  //if we find user, return user
  //if not, return null
  for (const userID in database) {
    const user = database[userID];
    if(user.email === email){
      return user;
    }
  }
  return null;
};
function userURLOnly(database, userid) {
  let result = {};
  for (const url in database) {
    if (database[url].userID === userid){
      result[url] = database[url];
    }
  }
  return result
}
const {generateRandomString, findByEmail, userURLOnly} = require()
// DATABASES..............................................
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  'trogdor': {
    id: 'trogdor',
    email: 'trog@gmail.com',
    password: bcrypt.hashSync('1234', salt)
  },
  'fhqwgads': {
    id: 'fhqwgads',
    email: 'comeon@gmail.com',
    password: bcrypt.hashSync('5678', salt)
  }
}

// GET HOME .............................................."/"
app.get("/", (req, res) => {
  let freeURLs = userURLOnly(urlDatabase, 'aJ48lW');
  const templateVars = { 
    urls: freeURLs,
    user: users[req.session['user_id']]        ///////////////////////////////ADDED STUFF////////////////////////////////////
  };
  // console.log(templateVars.user_id)
  res.render("urls_index", templateVars);
});

// GET LOGIN.............................................."/login"
app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.session['user_id']]
  };
  res.render("urls_login", templateVars)
});

// GET REGISTER .........................................."/register"
app.get("/register", (req, res) =>{
  const templateVars = {
    user: users[req.session['user_id']], 
  }
  res.render("urls_register", templateVars)
});

// GET MY URLS............................................"/urls"
app.get("/urls", (req, res) => {
  const user =  users[req.session['user_id']]; 

  if(!user){
    const templateVars = {
      user: users[req.session['user_id']],
      message: "You are not Logged in"        
    };
    res.render("urls_400", templateVars)
  }
  let userUrls = userURLOnly(urlDatabase, user.id);

  const templateVars = { 
    urls: userUrls,
    user: users[req.session['user_id']]
  };
  res.render("urls_my_urls", templateVars);
});

// GET CREATE NEW URL ...................................."/urls/new"
app.get("/urls/new", (req, res) => {
  const user =  users[req.session['user_id']] ; 
  if(!user){
    return res.redirect("/login")
  }

  const templateVars = { 
    urls: urlDatabase,
    user: users[req.session['user_id']]  
    
  };
  console.log("THIS IS THE user_id", users[req.session['user_id']])
  
  res.render("urls_new", templateVars);
});

// GET SHORT URL.........................................."/urls/:shortURL"
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
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session['user_id']]         
  };
  res.render("urls_show", templateVars);
});

// GET REDIRECTED TO LONG URL ............................"/u/:shortURL"
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// GET 404 ..............................................."/urls_404"
app.get("/urls_404", (req, res) => {
  const templateVars = {
    shortURL : req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.session['user_id']] ,
    message: "Not found"        
  };

  res.render("urls_404", templateVars)
});

// GET 403 ..............................................."/urls_403"
app.get("/urls_403", (req, res) => {
  const templateVars = {
    shortURL : req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.session['user_id']],
    message: "Forbiden"        
  };

  res.render("urls_403", templateVars)
});

// GET 400 ..............................................."/urls_400"
app.get("/urls_400", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']],
    message: "Bad Equest"        
  };

  res.render("urls_400", templateVars)
});

// GET JSON .............................................."/urls.json"
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// POST DELETE URL........................................"/urls/:shortURL/delete"
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session['user_id']]; 
  if(!user){
    return res.redirect("/login")
  }
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  console.log(urlToDelete);
  res.redirect("/");
});

// POST EDIT URL.........................................."/urls/:shortURL/update"
app.post("/urls/:shortURL/update", (req, res) => {
  const user = users[req.session['user_id']] ; 
  if(!user){
    return res.redirect("/login")
  };
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  console.log(urlDatabase)
  res.redirect("/urls")
});

// POST CREATE NEW URL...................................."/urls/new"
app.post('/urls', (req, res) => {
  const user = users[req.session['user_id']] ; 
  if(!user) {
    return res.redirect("/login")
  };
  let longURL = req.body.longURL;
  if(!longURL.includes("://")){
    longURL = "http://" + longURL;
  }
  console.log(urlDatabase)
  let newKey = generateRandomString();
  if(!urlDatabase[newKey]) {

    urlDatabase[newKey] = {
      longURL,
      userID: user.id //TODO
    }
    console.log("Adding new key",urlDatabase)
  }
  // urlDatabase[newKey].longURL = longURL; 
  res.redirect(`/urls/${newKey}`)
});

// POST LOGIN............................................."/login"
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //check if we are not missing either name or email
  if(!email || !password){
    const templateVars = {
      user: users[req.session['user_id']],
      message: "Missing your email and/or password" 
    }
    return res.render("./urls_400", templateVars)
  }

  //find user based on email
  const user = findByEmail(email, users);

  //user not found
  if(!user) {
    const templateVars = {
      user: users[req.session['user_id']] ,
      message: "No user with this email was found :'(" 
    }
    return res.render("./urls_403", templateVars)
  }

  //found user, does the password match?
 if(!bcrypt.compareSync(password, user.password)) {
    const templateVars = {
      user: users[req.session['user_id']],
      message: "Is your caps lock on? Because that's not your password... fool..." 
    }
    return res.render("./urls_403", templateVars)
  }

  //found user, does hash match?
  if(bcrypt.compareSync(password, user.password)){
    //set cookie and redirect to my urls page
    req.session['user_id'] = user.id;
    return res.redirect('/urls')
  }
});

// POST LOGOUT ............................................"/logout"
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/')

});

// POST REGISTER .........................................."/register"
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10)
  
  //check if we are not missing either name or email
  if(!email || !password){
    const templateVars = {
      user: users[req.session['user_id']],
      message: "Missing your email and/or password" 
    }
    return res.render("./urls_400", templateVars)
  }

  //find out if email is already registered
  const user = findByEmail(email, users);
  if(user) {
    const templateVars = {
      user: users[req.session['user_id']],
      message: "Your email is already signed up!" 
    }

    return res.render('./urls_400', templateVars)
  }

  //add the new user to our users object
  const id = generateRandomString();

  const newUser = {
    id,
    email,
    password: hashedPassword
  }

  users[id] = newUser;
  
  // storing the user id value with cookie session
  req.session['user_id'] = newUser.id;

  //redirect newUser to their personal myURLs page
  res.redirect('/urls')   

});

// LISTNER.................................................
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});