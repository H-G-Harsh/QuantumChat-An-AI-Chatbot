import express from "express";
import ImageKit from "imagekit";
import cors from "cors";
import mongoose from "mongoose";
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import userchat from "./models/userchat.js";
import chat from "./models/chat.js";
import { generateChatResponse } from './utils/chatHelper.js';  // Import chatHelper.js for AI logic
const port = process.env.PORT || 3000;
const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("connected to mongo db");
  } catch (err) {
    console.log(err);
  }
};

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY
});

app.get("/api/upload", (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
});

app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { text } = req.body;
  try {
    // Create a new chat entry
    const newChat = new chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();

    // Check and create or update userChats
    const userChats = await userchat.find({ userId: userId });
    if (!userChats.length) {
      const newUserChats = new userchat({
        userId: userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });
      await newUserChats.save();
    } else {
      await userchat.updateOne({ userId: userId }, {
        $push: {
          chats: {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        }
      });
    }

    res.status(201).send(savedChat._id);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating chat!");
  }
});

app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  try {
    const userChats = await userchat.find({ userId });
    res.status(200).send(userChats[0].chats);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chats!");
  }
});

app.get("/api/chat/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  try {
    const chat1 = await chat.findOne({ _id: req.params.id, userId });
    res.status(200).send(chat1);
  } catch (err) {
    console.log(err);
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
    const updatedChat = await chat.updateOne({ _id: req.params.id, userId }, {
      $push: {
        history: {
          $each: newItems,
        }
      }
    });
    res.status(200).send(updatedChat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding conversation!");
  }
});

app.post('/api/generate-response', async (req, res) => {
  const { query } = req.body;

  try {
    const { primary_response, follow_up_questions } = await generateChatResponse(query);

    // Log the response and suggestions to check if the data is coming through correctly
    console.log(primary_response);
    console.log(follow_up_questions);

    res.status(200).json({
      primary_response,
      follow_up_questions
    });
  } catch (err) {
    console.error("Error generating AI response:", err);
    res.status(500).send("Error generating AI response!");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send('Unauthenticated!');
});

app.listen(port, () => {
  connect();
  console.log("Server running on port 3000");
});
