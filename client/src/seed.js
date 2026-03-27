import mongoose from "mongoose";
import dotenv from "dotenv";
import { gigs } from "./data.js";
import Gig from "../models/gig.model.js";
import connectDB from "../configs/db.js";

dotenv.config();

const seedGigs = async () => {
  try {
    await connectDB();
    await Gig.deleteMany(); // remove old
    await Gig.insertMany(gigs); // insert new
    console.log("✅ Dummy gigs inserted!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding gigs:", error.message);
    process.exit(1);
  }
};

seedGigs();
