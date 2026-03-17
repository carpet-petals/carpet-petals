const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const Admin = require("./models/Admin");

// CHANGE THESE TO WHATEVER YOU WANT
const USERNAME = process.env.ADMIN_USERNAME;
const PASSWORD = process.env.ADMIN_PASSWORD;

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const hashed = await bcrypt.hash(PASSWORD, 12);
    await Admin.findOneAndUpdate(
      { username: USERNAME },
      { username: USERNAME, password: hashed },
      { upsert: true, new: true }
    );
    console.log(`Admin created/updated successfully`);
    console.log(`Username: ${USERNAME}`);
    console.log(`Password: ${PASSWORD}`);
    console.log(`\nYou can now login at /admin/login`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

createAdmin();