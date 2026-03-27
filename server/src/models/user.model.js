const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true, // 🧹 Trim extra spaces
      lowercase: true, // 🔡 Consistent casing
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"], // ✅ Email format validation
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password should be at least 6 characters"], // 🔐 Security basic
    },
    image: {
      type: String,
      default: "", // ✅ Default empty string
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      match: [/^\d{10,15}$/, "Invalid phone number"], // 📞 Basic validation
    },
    description: {
      type: String,
      required: true,
      maxlength: 500, // 📝 Limit to avoid bloat
    },
    isSeller: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
