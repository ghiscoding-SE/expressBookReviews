const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if username is not empty and contains only alphanumeric characters
  return username && /^[a-zA-Z0-9]+$/.test(username);
}

const authenticatedUser = (username, password) => {
  // Check if username and password match our records
  return users.find(u => u.username === username && u.password === password) !== undefined;
}

// Task 7: Login as a Registered user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!isValid(username)) {
    return res.status(400).json({ error: 'Invalid username format' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, 'your-secret-key');
  res.json({ token });
});

// Task 8: Add/Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { text } = req.body;
  const book = books.find(b => b.isbn === req.params.isbn);

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  if (!text) {
    return res.status(400).json({ error: 'Valid review text is required' });
  }

  const existingReviewIndex = book.reviews.findIndex(r => r.user === req.user.username);
  const review = { user: req.user.username, text };

  if (existingReviewIndex >= 0) {
    book.reviews[existingReviewIndex] = review;
  } else {
    book.reviews.push(review);
  }

  res.status(201).json(review);
});

// Task 9: Delete book review added by that particular user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = books.find(b => b.isbn === req.params.isbn);

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const reviewIndex = book.reviews.findIndex(r => r.user === req.user.username);

  if (reviewIndex === -1) {
    return res.status(404).json({ error: 'Review not found' });
  }

  book.reviews.splice(reviewIndex, 1);
  res.json({ message: 'Review deleted successfully' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;