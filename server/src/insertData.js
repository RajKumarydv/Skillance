require("dotenv").config();
const connectDB = require("./configs/db");
const Gig = require("./models/gig.model");
const { gigs } = require("./data/seedData"); // ✅ Destructure correctly

const insertData = async () => {
  try {
    await connectDB();
    await Gig.deleteMany(); // Optional: Purana data delete kare
    const inserted = await Gig.insertMany(gigs);
    console.log(`✅ Seed data inserted successfully: ${inserted.length} gigs`);
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

insertData();
