import mongoose from "mongoose";
import User from "../models/user.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "backend/config/config.env" });

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@shopit.com" });
    
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: admin@shopit.com");
      console.log("You can login with existing credentials");
      process.exit();
    }

    // Create admin user
    const adminUser = await User.create({
      name: "Administrator",
      email: "admin@shopit.com",
      password: "admin123456", // This will be hashed automatically by the pre-save middleware
      role: "admin",
      avatar: {
        public_id: "admin_avatar",
        url: "https://res.cloudinary.com/udemy-courses/image/upload/v1698577488/shopit/demo/default_avatar.jpg"
      }
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@shopit.com");
    console.log("🔑 Password: admin123456");
    console.log("👑 Role: admin");
    console.log("");
    console.log("🚀 You can now login and access the admin dashboard!");
    
    process.exit();
  } catch (error) {
    console.log("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();