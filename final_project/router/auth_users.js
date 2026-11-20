const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{
//write code to check if username and password match the one we have in records.
 for (const user of users) {
    if (user.username === username && user.password === password) {
      return true;
    }
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  
  // Validate credentials
  if (authenticatedUser(username, password)) {
    // Create JWT token
    const token = jwt.sign({ username }, "access", { expiresIn: "1h" });
    // Save token to session
    req.session.authorization = { accessToken: token };
    return res.status(200).json({ message: "User logged in successfully", token });
  } else {
    return res.status(403).json({ message: "Invalid credentials" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.username;
  
  // Get the book
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  
  // Initialize reviews object if it doesn't exist
  if (!book.reviews) {
    book.reviews = {};
  }
  
  // Post or modify the review for this user under this ISBN
  book.reviews[username] = review;
  
  return res.status(200).json({ 
    message: "Review " + (book.reviews[username] === review ? "updated" : "posted"),
    isbn,
    username,
    review
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;
  
  // Get the book
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  
  // Check if the user has a review for this book
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "You have not reviewed this book" });
  }
  
  // Delete the review for this user
  delete book.reviews[username];
  
  // Optionally, remove the reviews object if it's now empty
  if (Object.keys(book.reviews).length === 0) {
    delete book.reviews;
  }
  
  return res.status(200).json({ 
    message: "Review deleted successfully",
    isbn,
    username
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
