import mongoose from "mongoose";
import UserModel from "@/lib/model/users";
import { connectionSrt } from "@/lib/dbconnect";
import { NextResponse } from "next/server";
import CryptoJS from 'crypto-js';


export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
console.log(name,email,password)
    // Connect to MongoDB
    await mongoose.connect(connectionSrt);
    // var ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123').toString();

    // Create a new user instance

    let newUser = new UserModel({
      name: name,
      email: email,
      password: CryptoJS.AES.encrypt(password, 'secret123').toString(),
    });

    // Save the user to the database
    const result = await newUser.save();

    // Close the MongoDB connection
    await mongoose.connection.close();

    return NextResponse.json({result:result,success:true});
  } catch (error) {
    console.error("Error:", error.message);

    // Make sure to close the MongoDB connection in case of an error
    await mongoose.connection.close();

    return NextResponse.json({ error: "Connection failed", success: false });
  }
}