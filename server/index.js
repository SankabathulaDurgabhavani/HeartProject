require('dotenv').config();
const axios = require("axios");
const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection with catch block
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
});

// Define all your schemas and models...

// User schema
const userSchema = new mongoose.Schema({ name: String, email: String, password: String });
const User = mongoose.model("User", userSchema);

// Health details schema
const healthSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phone: String,
  email: String,
  bloodGroup: String,
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  healthHistory: String,
  allergies: String,
  emergencyContacts: [String]
});
const HealthRecord = mongoose.model("HealthRecord", healthSchema);

// Fitbit token and health schemas
const fitbitTokenSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  access_token: String,
  refresh_token: String,
  user_id: String,
  expires_at: Number
});
const FitbitToken = mongoose.model("FitbitToken", fitbitTokenSchema);

const fitbitDataSchema = new mongoose.Schema({
  email: { type: String, required: true },
  heartRate: Number,
  steps: Number,
  calories: Number,
  sleepMinutes: Number,
  respiratory_rate: Number,
  oxygen_saturation: Number,
  temperature: Number,
  timestamp: { type: Date, default: Date.now }
});
const FitbitHealth = mongoose.model("FitbitHealth", fitbitDataSchema);

// Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Routes...
app.post("/register-health", async (req, res) => {
  try {
    const newHealth = new HealthRecord(req.body);
    await newHealth.save();
    res.json({ message: "Health registration successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving health data" });
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.json({ message: "User already exists" });
  await new User({ name, email, password }).save();
  res.json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "User not found" });
  if (user.password !== password) return res.json({ message: "Invalid password" });
  res.json({ message: "Login Successful" });
});

// Add the rest of the routes from your existing file here

app.listen(3001, () => {
  console.log("🚀 Server is running on port 3001");
});
