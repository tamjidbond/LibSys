const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI (Use .env for security)
const uri =
  "mongodb+srv://bondtamjid02:Tpzk32mZjmjeR6T@libsys.tkpbo.mongodb.net/?retryWrites=true&w=majority&appName=LibSys";

// Create MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let usersCollection;
let booksCollection;

// Connect once and keep connection alive
client
  .connect()
  .then(() => {
    const db = client.db("user_management");

    // Initialize collections after db connection
    usersCollection = db.collection("users");
    booksCollection = db.collection("books");
    borrowedBooksCollection = db.collection("borrowedBooks"); // <-- add this
    adminsCollection = db.collection("admins");
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// 🟢 Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 🟢 Add a new user
app.post("/api/users", async (req, res) => {
  try {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to add user" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = req.body;

    // Remove _id from updatedUser if it's in the request body
    delete updatedUser._id; // This will prevent updating the _id field, which is immutable

    // Check if the updated user data is valid
    if (!updatedUser.name || !updatedUser.email || !updatedUser.username) {
      return res
        .status(400)
        .json({ error: "Please provide all necessary fields." });
    }

    // Update the user in the database
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedUser }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return a success response
    res.json({ message: "User updated successfully!" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user." });
  }
});

// 🟢 Delete user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// GET total counts
// GET total counts
app.get("/dashboard/stats", async (req, res) => {
  try {
    const userCount = await usersCollection.countDocuments();
    const bookCount = await booksCollection.countDocuments();

    const borrowedBooks = await booksCollection.countDocuments({
      availability: "Borrowed",
    });
    const returnedBooks = await booksCollection.countDocuments({
      availability: "Available",
    });

    res.json({
      userCount,
      bookCount,
      borrowedBooks,
      returnedBooks,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

// GET overdue borrowers
app.get("/dashboard/overdue", async (req, res) => {
  const now = new Date();
  const overdue = await borrowedBooksCollection
    .find({ dueDate: { $lt: now }, returned: false })
    .toArray();
  res.json(overdue);
});

// GET admin list
app.get("/dashboard/admins", async (req, res) => {
  const admins = await adminsCollection.find().toArray();
  res.json(admins);
});

// 🟢 Get all books
app.get("/books", async (req, res) => {
  try {
    const books = await booksCollection.find().toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟢 Add a new book
// Add a new book
app.post("/books", async (req, res) => {
  const { name, type, language, availability, quantity } = req.body;

  const newBook = {
    name,
    type,
    language,
    availability: availability || "Available",
    // Default to "Available" if not provided
    quantity: quantity || 1, // Default to 1 if not provided
  };

  try {
    const result = await booksCollection.insertOne(newBook);

    if (result.acknowledged === true) {
      const addedBook = await booksCollection.findOne({
        _id: result.insertedId,
      });
      res.status(201).json(addedBook); // Return the book object after inserting
    } else {
      res.status(400).json({ message: "Failed to add the book" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to add the book" });
  }
});

// 🟢 Update a book by ID
app.put("/books/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, language, availability, quantity } = req.body;

  const updatedBook = {
    name,
    type,
    language,
    availability,
    quantity,
  };

  try {
    const result = await booksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedBook }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 🟢 Delete a book by ID
app.delete("/books/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await booksCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(204).json(); // No content to return for delete operation
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
