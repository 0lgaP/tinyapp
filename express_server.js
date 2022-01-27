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
function userURLOnly(database) {
  let result = [];

  for (const url in database) {
    result.push(url)
  }

  return result
}


// DATABASES
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
    password: '1234',
  },
  'fhqwgads': {
    id: 'fhqwgads',
    email: 'comeon@gmail.com',
    password: '5678',
  }
}

// GET HOME ............................................
app.get("/", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]        ///////////////////////////////ADDED STUFF////////////////////////////////////
  };
  // console.log(templateVars.user_id)
  res.render("urls_index", templateVars);
});

// GET  LOGIN..............................................
app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars)
});

// GET REGISTER .......................
app.get("/register", (req, res) =>{
  const templateVars = {
    user: users[req.cookies["user_id"]],
    
  }
  // console.log(req.cookies["user_id"])
  res.render("urls_register", templateVars)
});

// GET MY URLS.......................................
app.get("/urls", (req, res) => {
  const user =  users[req.cookies["user_id"]]; 
  if(!user){
    const templateVars = {
      user: users[req.cookies["user_id"]],
      message: "You are not Logged in"        
    };
    res.render("urls_400", templateVars)
  }
  let userUrls = userURLOnly(urlDatabase);
  console.log("USER URL LIST???", userUrls)
  
  console.log("database   ", urlDatabase)
  console.log("usersreqcookiesuseris  ", user)
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]        ///////////////////////////////ADDED STUFF////////////////////////////////////
  };
  console.log(templateVars.urls)
  res.render("urls_my_urls", templateVars);
});

// GET CREATE NEW URL .......................................
app.get("/urls/new", (req, res) => {
  const user =  users[req.cookies["user_id"]]; 
  if(!user){
    return res.redirect("/login")
  }

  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] 
    
  };
  console.log("THIS IS THE user_id", users[req.cookies["user_id"]])
  
  res.render("urls_new", templateVars);
});

// GET SHORT URL........../urls/:shortURL .................................
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
    user: users[req.cookies["user_id"]]         
  };
  res.render("urls_show", templateVars);
});

// GET REDIRECTED TO LONG URL ......./u/:shortURL ....................................
app.get("/u/:shortURL", (req, res) => {
  // console.log(req.params.shortURL);
  let shortURL = req.params.shortURL;
 const longURL = urlDatabase[shortURL].longURL;
//  console.log(longURL)
 res.redirect(longURL);
});

// GET 404 ........................................
app.get("/urls_404", (req, res) => {
  const templateVars = {
    shortURL : req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
    message: "Not found"        
  };

  res.render("urls_404", templateVars)
});

// GET 403 ........................................
app.get("/urls_404", (req, res) => {
  const templateVars = {
    shortURL : req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
    message: "Forbiden"        
  };

  res.render("urls_403", templateVars)
});

// GET 400 ........................................
app.get("/urls_400", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    message: "Bad Equest"        
  };

  res.render("urls_400", templateVars)
});

// GET JSON ..../urls.json ........................................
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// POST DELETE URL..... /urls/:shortURL/delete ...............
app.post("/urls/:shortURL/delete", (req, res) => {
  const user =  users[req.cookies["user_id"]]; 
  if(!user){
    return res.redirect("/login")
  }
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  console.log(urlToDelete);
  res.redirect("/");
});

// POST UPDATE URL.... /urls/:shortURL/update ................
app.post("/urls/:shortURL/update", (req, res) => {
  const user =  users[req.cookies["user_id"]]; 
  if(!user) {
    return res.redirect("/login")
  };
  // console.log("req.params", req.params)
  console.log(urlDatabase)
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  console.log(urlDatabase)

  res.redirect("/")
});

// POST CREATE NEW URL..../urls ...................................
app.post('/urls', (req, res) => {
  const user = users[req.cookies["user_id"]]; 
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

});

// POST LOGOUT .......... /logout ........................
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/')

});

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

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});