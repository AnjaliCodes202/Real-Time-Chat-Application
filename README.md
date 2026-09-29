# Real-Time Chat Application

A high-performance, real-time messaging application built on the MERN stack with Socket.IO, strictly following a minimalist and robust architecture.

## 🚀 Features

- **Authentication & Security**: Secure signup/login with JWT and HTTP-only cookies, protected API routes, and bcrypt password hashing.
- **Real-Time Chat**: Bidirectional, low-latency messaging powered by Socket.IO.
- **Presence Tracking**: See when users are online or offline in real-time.
- **Idempotency**: Prevent duplicate messages during network retries using `clientMessageId`.
- **Media Uploads**: Update profile pictures and send image attachments in chat via Cloudinary integration.
- **Premium UI**: Designed with Tailwind CSS 3 and DaisyUI 4 for an excellent user experience.
- **Global State Management**: Powered by Zustand for a lean, fast, and simple global state architecture.

## 🛠 Tech Stack

### Frontend
- React (Vite)
- React Router
- Zustand
- Tailwind CSS v3
- DaisyUI v4
- Socket.IO Client
- Axios
- Lucide React (Icons)

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.IO
- Cloudinary
- JWT (JSON Web Tokens)
- bcrypt

## 📁 Architecture

The project adheres to a strict, minimal architecture pattern:

```text
backend/
└── src/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    ├── lib/ (db, socket, cloudinary)
    └── index.js

frontend/
└── src/
    ├── components/
    ├── pages/
    ├── store/ (useAuthStore, useChatStore)
    ├── lib/ (axios instance)
    └── App.jsx
```

## ⚙️ Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/real-chat-app
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Run the backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Run the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## 🗄️ Database Design

**User Model:**
- name, email, password, profilePicture, bio, lastSeen, timestamps

**Message Model:**
- sender (ObjectId), receiver (ObjectId), text, attachment (url, type, size), clientMessageId (Unique idempotency key), status, editedAt, deletedAt, timestamps

## 🔌 Socket Events

- `connection`: Fired when a user connects (updates online list).
- `getOnlineUsers`: Broadcasts the current list of online users.
- `newMessage`: Emitted to the receiver when a new message is sent.
- `typing:start` & `typing:stop`: Emitted for typing indicators (implemented backend skeleton).
- `messageEdited` & `messageDeleted`: Fired for message lifecycle modifications.
- `disconnect`: Fired when a user drops off.

---
*Built with simplicity, performance, and best engineering practices.*
