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

module.exports = {generateRandomString, findByEmail, userURLOnly}