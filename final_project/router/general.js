const axios = require('axios');
const express = require('express');
const jwt = require('jsonwebtoken');

const config = require('../config.js');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 1. Get the book list available in the shop
public_users.get('/', function (req, res) {
  if (!books) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(books);
});

// Task 2. Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const book = books.find(b => b.isbn === req.params.isbn);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

// Task 3. Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const authorBooks = books.filter(b => b.author.toLowerCase().includes(req.params.author.toLowerCase()));
  if (!authorBooks || authorBooks.length === 0) {
    return res.status(404).json({ error: 'No book found for author: ' + req.params.author });
  }
  res.json(authorBooks);
});

// Task 4. Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const titleBooks = books.filter(b =>
    b.title.toLowerCase().includes(req.params.title.toLowerCase())
  );
  res.json(titleBooks);
});

// Task 5. Get book review
public_users.get('/review/:isbn', function (req, res) {
  const book = books.find(r => r.isbn === req.params.isbn);
  res.json(book.reviews || []);
});

// Task 6: Register New user
public_users.post('/register', function (req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (users.some(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  users.push({ username, password });
  res.status(200).json({ message: 'User registered successfully' });
});

// ---
// Tasks 10-13: Async operations with Axios
// ---

// Task 10: Get all books – Using async callback function
public_users.get('/axios/books', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${config.PORT}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Error fetching books', message: error.message });
  }
});

// Task 11: Search by ISBN – Using Promises
public_users.get('/axios/isbn/:isbn', (req, res) => {
  axios.get(`http://localhost:${config.PORT}/isbn/${req.params.isbn}`)
    .then(response => res.json(response.data))
    .catch(error => res.status(500).json({ error: 'Error fetching book by ISBN', message: error.message }));
});

// Task 12: Search by Author
public_users.get('/axios/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${config.PORT}/author/${req.params.author}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching books by author', message: error.message });
  }
});

// Task 13: Search by Title
public_users.get('/axios/title/:title', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${config.PORT}/title/${req.params.title}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching books by title', message: error.message });
  }
});

module.exports.general = public_users;
