import mongoose from "mongoose";
import products from "./data.js";
import Product from "../models/product.js";
import User from "../models/user.js";

const seedProducts = async () => {
  try {
    const dbUri = process.env.DB_URI || "mongodb://localhost:27017/shopIT";
    await mongoose.connect(dbUri);

    await Product.deleteMany();
    console.log("Products are deleted");

    // Find existing admin user
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("No admin user found! Run adminSeeder.js first.");
      process.exit(1);
    }

    // Add user to each product
    const productsWithUser = products.map(p => ({ ...p, user: adminUser._id }));

    await Product.insertMany(productsWithUser);
    console.log("Products are added");

    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
};

seedProducts();
