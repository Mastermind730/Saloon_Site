import mongoose from "mongoose";
import UserModel from "@/lib/model/users";
import { connectionSrt } from "@/lib/dbconnect";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    console.log(email, password);

    // Connect to MongoDB
    await mongoose.connect(connectionSrt);
    
    // Find a user with the provided email
    let user = await UserModel.findOne({ email: email });
    
    if (user) {
      // Decrypt the stored password
      var bytes = CryptoJS.AES.decrypt(user.password, "secret123");
      var originalText = bytes.toString(CryptoJS.enc.Utf8);

      // Check if the provided password matches the user's password
      if (originalText === password && email === user.email) {
        var token = jwt.sign({ success: true, email: user.email, password: user.password }, 'jwtsecret');
        console.log("token", token);
        
        // Send the token as part of a JSON object
        return NextResponse.json({
          token: token,
          success: true
        });
      } else {
        // Return error message if password is incorrect
        return NextResponse.json({
          error: "Invalid Credentials",
          success: false,
        });
      }
    } else {
      // Return error message if user doesn't exist
      return NextResponse.json({ error: "User doesn't exist", success: false });
    }
  } catch (error) {
    console.error("Error:", error.message);

    // Make sure to close the MongoDB connection in case of an error
    await mongoose.connection.close();

    // Return error message for the client
    return NextResponse.json({ error: "Connection failed", success: false });
  }
}