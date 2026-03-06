💬 RealTime-Chat-WebApp

A real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js), styled using Tailwind CSS, state-managed with Zustand, powered by Socket.io for instant communication, and integrated with Cloudinary for media sharing.

This open-source chat app enables one-to-one and group messaging, secure user authentication, media uploads, and persistent chat history. Designed as a modern, scalable, and responsive messaging platform, it’s perfect for learning or deploying a production-ready chat system.

🚀 Key Features

⚡ Real-time Messaging App – Instant communication using Socket.io with live updates.

🧑‍🤝‍🧑 Authentication & Profiles – Secure login, user management, and customizable profiles.

📷 Image & Media Sharing – Upload, store, and share media with Cloudinary cloud storage.

🗂 Private & Group Chats – Create personal or group chat rooms with seamless sync.

🌙 Responsive Modern UI – Built with React + Tailwind CSS for fast, mobile-friendly design.

📦 Lightweight State Management – Scalable global state handling using Zustand.

🗄 Persistent Data Storage – Chat history and users stored securely in MongoDB with Mongoose.

🛠️ Tech Stack

Frontend: React, Tailwind CSS, Zustand

Backend: Node.js, Express.js, Socket.io

Database: MongoDB (Mongoose ODM)

Media Storage: Cloudinary

State Management: Zustand

📌 Why This Project?

This real-time chat web app is designed as a full-stack project for developers who want to learn or implement:

A React chat application with modern UI/UX.

Real-time communication using WebSockets & Socket.io.

Scalable full-stack architecture with the MERN stack.

Cloud-based media upload & storage with Cloudinary.

Best practices in state management, authentication, and data persistence.

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/01SubhadipG/RealTime-Chat-WebApp.git](https://github.com/01SubhadipG/RealTime-Chat-WebApp.git)
    cd RealTime-Chat-WebApp
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd client
    npm install
    ```

4.  **Environment Configuration**
    Create a `.env` file in the `server` directory and add the following variables:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

5.  **Run the Application**
    
    *Start the Backend server:*
    ```bash
    cd server
    npm run dev
    ```

    *Start the React Frontend:*
    ```bash
    cd client
    npm run dev
    ```
