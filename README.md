# QuantumChat - AI Chatbot

<div align="center">
  <img src="frontend/public/final.jpg" alt="QuantumChat Logo" width="120" height="120" style="border-radius: 50%;">
  
  <h3>Experience the Future of AI Conversations</h3>

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-blue?style=for-the-badge&logo=vercel)](https://quantumchat-phi.vercel.app/)
</div>

---

## Features

- **Modern UI/UX**: Responsive, dark theme, mobile-first, smooth animations  
- **AI Conversations**: Powered by Google Gemini, real-time streaming, context-aware, smart suggestions  
- **Chat Tools**: Image analysis, persistent history, export, and search  
- **Authentication**: Supabase auth, Google OAuth, secure routes  

---

## Live Demo

- **Full Project**: [quantumchat-phi.vercel.app](https://quantumchat-phi.vercel.app/)  
- **Backend API**: [quantum-chat-an-ai-chatbot.vercel.app](https://quantum-chat-an-ai-chatbot.vercel.app/)  

---

## Tech Stack

**Frontend**: React 18, Vite, React Query, React Router  
**Backend**: Node.js, Express.js, MongoDB (Mongoose)  
**AI & Services**: Google Gemini, Supabase, ImageKit  
**Deployment**: Vercel, MongoDB Atlas  

---

## Quick Start

### Prerequisites
- Node.js v18+  
- MongoDB (local or Atlas)  
- Supabase account (for auth)
  
### Environment Setup

### Backend Environment Variables

Create `backend/.env`:

```env
# Server Configuration
CLIENT_URL=http://localhost:5173

# Database
MONGO=mongodb+srv://username:password@cluster.mongodb.net/quantumchat?retryWrites=true&w=majority

# Supabase Authentication
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# ImageKit Configuration
IMAGE_KIT_ENDPOINT=https://ik.imagekit.io/your-imagekit-id
IMAGE_KIT_PUBLIC_KEY=your-imagekit-public-key
IMAGE_KIT_PRIVATE_KEY=your-imagekit-private-key
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# ImageKit Configuration
VITE_IMAGE_KIT_ENDPOINT=https://ik.imagekit.io/your-imagekit-id
VITE_IMAGE_KIT_PUBLIC_KEY=your-imagekit-public-key

# Google Gemini AI
VITE_GEMINI_PUBLIC_KEY=your-gemini-api-key
```


### Setup
```bash
# Clone repository
git clone https://github.com/H-G-Harsh/QuantumChat-An-AI-Chatbot.git
cd QuantumChat-An-AI-Chatbot

# Backend setup
cd backend
npm install
npm start

# Frontend setup in new terminal
cd frontend
npm install
npm run dev
```
---
## Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Supabase** for authentication and database services
- **Vercel** for seamless deployment
- **ImageKit** for image processing
- **MongoDB** for flexible data storage
- **React Community** for amazing tools and libraries
  
