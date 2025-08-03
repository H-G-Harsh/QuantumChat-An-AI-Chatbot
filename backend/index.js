import express from "express";
import ImageKit from "imagekit";
import cors from "cors";
import path from "path";
import url, { fileURLToPath } from "url";
import mongoose from "mongoose";
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import userchat from "./models/userchat.js";
import chat from "./models/chat.js";
import { generateChatResponse } from './utils/chatHelper.js';

const port = process.env.PORT || 3000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(ClerkExpressWithAuth());

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

app.get('/', (req, res) => {
  res.send({
    activeStatus: true,
    error: false,
  });
});

app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

app.post("/api/chats", async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { text } = req.body;

  try {
    const newChat = new chat({
      userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();

    const userChats = await userchat.find({ userId });
    if (!userChats.length) {
      const newUserChats = new userchat({
        userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });
      await newUserChats.save();
    } else {
      await userchat.updateOne({ userId }, {
        $push: {
          chats: {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        }
      });
    }

    res.status(201).json({ _id: savedChat._id });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating chat!");
  }
});

app.get("/api/userchats", async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const userChats = await userchat.find({ userId });
    res.status(200).send(userChats[0]?.chats || []);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chats!");
  }
});

app.get("/api/chat/:id", async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const chat1 = await chat.findOne({ _id: req.params.id, userId });
    res.status(200).send(chat1);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chat!");
  }
});

app.put("/api/chats/:id", async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

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
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

app.listen(port, () => {
  connect();
  console.log("Server running on port 3000");
});
