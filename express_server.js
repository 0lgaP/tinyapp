// REQUIRE LIST.......................................
const express = require("express");
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const app = express();
const {generateRandomString, findByEmail, userURLOnly} = require('./helpers');

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

// DATABASES..............................................
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  SfeUW5: {
    longURL: 'http://www.yahoo.ca',
    userID: 'trogdor'
  },
  RWUSX7: {
    longURL: 'http://www.homestarrunner.com',
    userID: 'trogdor'
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
};

// GET HOME .............................................."/"
app.get("/", (req, res) => {
  let freeURLs = userURLOnly(urlDatabase, 'aJ48lW');
  const templateVars = {
    urls: freeURLs,
    user: users[req.session['user_id']]
  };
  res.render("urls_index", templateVars);
});

// GET LOGIN.............................................."/login"
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session['user_id']]
  };
  res.render("urls_login", templateVars);
});

// GET REGISTER .........................................."/register"
app.get("/register", (req, res) =>{
  const templateVars = {
    user: users[req.session['user_id']]
  };
  res.render("urls_register", templateVars);
});

// GET MY URLS............................................"/urls"
app.get("/urls", (req, res) => {
  const user =  users[req.session['user_id']];

  if (!user) {
    return res.redirect("/login");
  }

  let userUrls = userURLOnly(urlDatabase, user.id);

  const templateVars = {
    urls: userUrls,
    user: users[req.session['user_id']]
  };

  console.log(urlDatabase);
  res.render("urls_my_urls", templateVars);
});

// GET CREATE NEW URL ...................................."/urls/new"
app.get("/urls/new", (req, res) => {
  const user =  users[req.session['user_id']];
  if (!user) {
    return res.redirect("/login");
  }

  const templateVars = {
    urls: urlDatabase,
    user: users[req.session['user_id']]
    
  };
  
  res.render("urls_new", templateVars);
});

// GET SHORT URL.........................................."/urls/:shortURL"
app.get("/urls/:shortURL", (req, res) => {
  let allKeys = Object.keys(urlDatabase);
  let shortURL = req.params.shortURL;
  if (!allKeys.includes(shortURL)) {
    const templateVars = {
      user: users[req.session['user_id']] ,
      message: "We could not find the Tiny URL you are looking for"
    };
    return res.status(404).render("urls_404", templateVars);
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
    user: users[req.session['user_id']] ,
    message: "Not found"
  };
  res.status(404).render("urls_404", templateVars);
});

// GET 403 ..............................................."/urls_403"
app.get("/urls_403", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']],
    message: "Forbiden"
  };
  res.status(403).render("urls_403", templateVars);
});

// GET 400 ..............................................."/urls_400"
app.get("/urls_400", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']],
    message: "Bad Request"
  };
  res.status(400).render("urls_400", templateVars);
});

// GET JSON .............................................."/urls.json"
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// POST DELETE URL........................................"/urls/:shortURL/delete"
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session['user_id']];
  if (!user) {
    return res.redirect("/login");
  }
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

// POST EDIT URL.........................................."/urls/:shortURL/update"
app.post("/urls/:shortURL/update", (req, res) => {
  const user = users[req.session['user_id']];
  if (!user) {
    return res.redirect("/login");
  }
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;

  res.redirect("/urls");
});

// POST CREATE NEW URL...................................."/urls/new"
app.post('/urls', (req, res) => {
  const user = users[req.session['user_id']];
  if (!user) {
    return res.redirect("/login");
  }
  let longURL = req.body.longURL;
  if (!longURL.includes("://")) {
    longURL = "http://" + longURL;
  }

  let newKey = generateRandomString();
  if (!urlDatabase[newKey]) {

    urlDatabase[newKey] = {
      longURL,
      userID: user.id //TODO
    };
  }
  // urlDatabase[newKey].longURL = longURL;
  res.redirect(`/urls/${newKey}`);
});

// POST LOGIN............................................."/login"
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //check if we are not missing either name or email
  if (!email || !password) {
    const templateVars = {
      user: users[req.session['user_id']],
      message: "Missing your email and/or password"
    };
    return res.status(400).render("./urls_400", templateVars);
  }

  //find user based on email
  const user = findByEmail(email, users);

  //user not found
  if (!user) {
    const templateVars = {
      user: users[req.session['user_id']] ,
      message: "No user with this email was found :'("
    };
    return res.status(403).render("./urls_403", templateVars);
  }

  //found user, does the password match?
  if (!bcrypt.compareSync(password, user.password)) {
    const templateVars = {
      user: users[req.session['user_id']],
      message: "Is your caps lock on? Please check that email or password and try again"
    };
    return res.status(403).render("./urls_403", templateVars);
  }

  //found user, does hash match?
  if (bcrypt.compareSync(password, user.password)) {
    //set cookie and redirect to my urls page
    req.session['user_id'] = user.id;
    return res.redirect('/urls');
  }
});

// POST LOGOUT ............................................"/logout"
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/');

});

// POST REGISTER .........................................."/register"
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  //check if we are not missing either name or email
  if (!email || !password) {
    const templateVars = {
      user: users[req.session['user_id']],
      message: "Missing your email and/or password"
    };
    return res.status(400).render("./urls_400", templateVars);
  }

  //find out if email is already registered
  const user = findByEmail(email, users);
  console.log(user);
  if (user) {
    const templateVars = {
      user: users[req.session['user_id']],
      message: "Your email is already signed up!"
    };
    return res.status(400).render('./urls_400', templateVars);
  }

  //add the new user to our users object
  const id = generateRandomString();

  const newUser = {
    id,
    email,
    password: hashedPassword
  };

  users[id] = newUser;
  
  // storing the user id value with cookie session
  req.session['user_id'] = newUser.id;

  //redirect newUser to their personal myURLs page
  res.redirect('/urls');

});

// LISTNER.................................................
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});