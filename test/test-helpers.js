const assert = require('chai').assert;
const {generateRandomString, findByEmail, userURLOnly} = require('../helpers');

// 🐱 Tests for generateRandomString
//----------------------------------

describe("generateRandomString", () => {
  it("it returns different strings every time it runs", () => {
    const input = generateRandomString()
    const output = generateRandomString()
    assert.notEqual(input, output);
  });
});

// 🐱 Test for findByMail
//-------------------------
describe("findByMail", () => {
  it(`should return a user with valid email`, () => {
    const users = {
      'trogdor': {
        id: 'trogdor',
        email: 'trog@gmail.com',
        password: '1234'
      },
      'fhqwgads': {
        id: 'fhqwgads',
        email: 'comeon@gmail.com',
        password: '4567'
      }
    }
    const email = 'trog@gmail.com'
    const expectedUserId = 'trogdor'
    assert.deepEqual(findByEmail(email, users), expectedUserId);
  });

  it(`should return null if user is not found`, () => {
    const users = {
      'trogdor': {
        id: 'trogdor',
        email: 'trog@gmail.com',
        password: '1234'
      },
      'fhqwgads': {
        id: 'fhqwgads',
        email: 'comeon@gmail.com',
        password: '4567'
      }
    }
    const email = 'mochaPassMe@gmail.com'
    const expectedUserId = 'trogdor'
    assert.notEqual(findByEmail(email, users), expectedUserId);
  });
});

// 🐱 Tests for userURLOnly
//----------------------------------

describe("userURLOnly", () => {
  it("it returns only the database objects containing the user id", () => {
    const urlDatabase = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ4ldk"
      }
    };

    const userID = "aJ4ldk"
    const expected = { i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ4ldk"
    } }

    assert.deepEqual(userURLOnly(urlDatabase, userID), expected)

  });
});
