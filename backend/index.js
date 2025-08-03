import express from "express";
import ImageKit from "imagekit";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

import userchat from "./models/userchat.js";
import chat from "./models/chat.js";
import { generateChatResponse } from './utils/chatHelper.js';

const port = process.env.PORT || 3000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
};

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY
});

// Public route
app.get('/', (req, res) => {
  res.send({
    activeStatus: true,
    error: false,
  });
});

// ImageKit auth
app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

// Clerk protected routes
app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { text } = req.body;

  try {
    const newChat = new chat({
      userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();

    const existing = await userchat.findOne({ userId });
    if (!existing) {
      await new userchat({
        userId,
        chats: [{ _id: savedChat._id, title: text.substring(0, 40) }],
      }).save();
    } else {
      await userchat.updateOne({ userId }, {
        $push: {
          chats: { _id: savedChat._id, title: text.substring(0, 40) }
        }
      });
    }

    res.status(201).json(savedChat._id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating chat!");
  }
});

app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  try {
    const userChats = await userchat.findOne({ userId });
    res.status(200).send(userChats?.chats || []);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching chats!");
  }
});

app.get("/api/chat/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  try {
    const chatData = await chat.findOne({ _id: req.params.id, userId });
    res.status(200).send(chatData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching chat!");
  }
});

app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { question, answer, img } = req.body;

  const newItems = [
    ...(question ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }] : []),
    { role: "model", parts: [{ text: answer }] },
  ];

  try {
    const updated = await chat.updateOne(
      { _id: req.params.id, userId },
      { $push: { history: { $each: newItems } } }
    );
    res.status(200).send(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating chat!");
  }
});

app.post('/api/generate-response', async (req, res) => {
  const { query } = req.body;

  try {
    const { primary_response, follow_up_questions } = await generateChatResponse(query);
    res.status(200).json({ primary_response, follow_up_questions });
  } catch (err) {
    console.error("AI response error:", err);
    res.status(500).send("Error generating AI response!");
  }
});

// Static frontend for production
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// Start server
app.listen(port, () => {
  connect();
  console.log(`🚀 Server running on port ${port}`);
});
