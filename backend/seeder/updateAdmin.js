import mongoose from "mongoose";
import User from "../models/user.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "backend/config/config.env" });

const updateAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected to MongoDB");

    // Find and update the admin user
    const adminUser = await User.findOneAndUpdate(
      { email: "admin@shopit.com" },
      { 
        name: "Administrator",
        avatar: {
          public_id: "admin_avatar",
          url: "https://res.cloudinary.com/udemy-courses/image/upload/v1698577488/shopit/demo/default_avatar.jpg"
        }
      },
      { new: true }
    );

    if (adminUser) {
      console.log("✅ Admin user updated successfully!");
      console.log("👤 Name: Administrator");
      console.log("📧 Email: admin@shopit.com");
      console.log("👑 Role: admin");
      console.log("");
      console.log("🔄 Please refresh your browser to see the changes!");
    } else {
      console.log("❌ Admin user not found!");
      console.log("💡 Run 'npm run seed:admin' to create a new admin user");
    }
    
    process.exit();
  } catch (error) {
    console.log("❌ Error updating admin:", error.message);
    process.exit(1);
  }
};

updateAdmin();