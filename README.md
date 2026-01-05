# DevConnector – A Developer Social Network

## Overview

DevConnector is a full-stack social networking platform built for developers to connect, share ideas, and showcase their expertise. It features authentication, user profiles, posts with likes/comments, and real-time interactions. This project demonstrates practical use of the MERN stack (MongoDB, Express, React, Node.js) with modern web development practices. :contentReference[oaicite:0]{index=0}

## Key Features

- **User Authentication & Authorization**  
  Secure signup and login using JWT (JSON Web Tokens). :contentReference[oaicite:1]{index=1}

- **User Profiles**  
  Users can create, edit, and display detailed profiles including bio, skills, experience, and GitHub repositories. :contentReference[oaicite:2]{index=2}

- **Post Management**  
  Create, read, update, and delete posts with interactive like/unlike and comment features. :contentReference[oaicite:3]{index=3}

- **Real-Time Updates**  
  Uses Socket.IO for real-time bidirectional communication between front end and back end (where applicable). :contentReference[oaicite:4]{index=4}

## Tech Stack

**Frontend**  
- React  
- React Router  
- Axios  
- Socket.IO Client (for real-time features if used)

**Backend**  
- Node.js & Express.js  
- MongoDB with Mongoose  
- JWT & bcrypt.js for secure authentication  
- Multer for file uploads (e.g., user avatars) :contentReference[oaicite:5]{index=5}

**Tools**  
- Postman (API testing)  
- Nodemon (dev server auto-reload) :contentReference[oaicite:6]{index=6}

## Live Demo

*(If you deploy the app later, place the link here.)*

Example:  
https://devconnector.yourdomain.com

## Prerequisites

Before running locally, install:

- Node.js (v14 or higher)
- MongoDB (local instance or MongoDB Atlas)

## Setup & Installation

Follow these steps to set up the project on your machine.

### 1. Clone the repository

```bash
git clone https://github.com/sak-dev-bit/DevConnector.git
cd DevConnector
````

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory with:

```
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
```

Start the backend server:

```bash
npm run dev
```

Server runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../client
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

## Directory Structure

```text
DevConnector/
├── client/                # React frontend code
│   ├── src/
│   └── public/
├── server/                # Node/Express backend
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── controllers/
├── .gitignore
├── README.md
└── package.json
```

## Screenshots

![alt text](<ScreenShots/Screenshot 2025-09-07 141334.png>)
![alt text](<ScreenShots/Screenshot 2025-09-07 141413.png>)
![alt text](<ScreenShots/Screenshot 2025-09-07 141642.png>)
![alt text](<ScreenShots/Screenshot 2025-09-07 141713.png>)
![alt text](<ScreenShots/Screenshot 2025-09-07 141929.png>)

## What I Learned

* Building full-stack web applications with React and Node.js
* Managing authentication securely with JWT
* CRUD operations and MVC structure in REST APIs
* Integrating frontend with backend APIs
* Basic real-time event handling with Socket.IO

## Future Improvements

* Add **unit & integration testing**
* Deploy backend and frontend on cloud platforms
* Improve UI/UX with better design and responsiveness
* Add notifications for likes/comments
* Expand real-time features (chat, live feed updates)
```
