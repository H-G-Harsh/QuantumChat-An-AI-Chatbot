import express from "express";
import ImageKit from "imagekit";
import cors from "cors";
import mongoose from "mongoose";
import { createClient } from '@supabase/supabase-js';
import userchat from "./models/userchat.js";
import chat from "./models/chat.js";
import { generateChatResponse } from './utils/chatHelper.js';  // Import chatHelper.js for AI logic
const port = process.env.PORT || 3000;
const app = express();

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Auth middleware for Supabase
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = { userId: user.id };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Test auth endpoint
app.get('/api/test-auth', requireAuth, (req, res) => {
  res.json({
    message: 'Authentication successful!',
    userId: req.user.userId
  });
});

app.get("/api/upload", (req, res) => {
    try {
        console.log('ImageKit authentication requested');
        const result = imagekit.getAuthenticationParameters();
        console.log('Authentication parameters generated:', result);
        res.send(result);
    } catch (error) {
        console.error('ImageKit authentication error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/chats", requireAuth, async (req, res) => {
  const userId = req.user.userId;
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

    res.status(201).json({ id: savedChat._id.toString() });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating chat!");
  }
});

app.get("/api/userchats", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  try {
    const userChats = await userchat.find({ userId });
    res.status(200).send(userChats.length > 0 ? userChats[0].chats : []);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chats!");
  }
});

app.get("/api/chat/:id", requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const chatId = req.params.id;
  
  console.log(`Fetching chat: ${chatId} for user: ${userId}`);
  
  try {
    const chat1 = await chat.findOne({ _id: chatId, userId });
    if (!chat1) {
      console.log(`Chat not found: ${chatId}`);
      return res.status(404).json({ error: "Chat not found" });
    }
    console.log(`Chat found: ${chatId}, history length: ${chat1.history?.length}`);
    res.status(200).send(chat1);
  } catch (err) {
    console.error(`Error fetching chat ${chatId}:`, err);
    res.status(500).json({ error: "Error fetching chat!" });
  }
});

app.put("/api/chats/:id", requireAuth, async (req, res) => {
  const userId = req.user.userId;
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
