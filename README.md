# DevConnector - A Developer Social Network

DevConnector is a social network platform built for developers to connect, share ideas, and showcase their skills. This is a full-stack application built using the MERN stack, with real-time features that make it feel dynamic and responsive.

-----

## Key Features

  * **User Registration & Authentication**: Secure user sign-up and login using JWT (JSON Web Token) authentication.
  * **User Profiles**: Create and manage detailed profiles with a bio, skills, experience, and GitHub repositories.
  * **Post Management**: Full CRUD (Create, Read, Update, Delete) functionality for social media posts.
  * **Interactive System**: Engage with content through a Like/Unlike and Comment system.
  * **Follow/Unfollow System**: Connect with other users on the platform.
  * **Image Uploads**: Store images for user avatars and posts.

-----

## Technologies Used

### Frontend

  * **React**: For building the user interface.
  * **React Router**: For handling client-side routing.
  * **Axios**: For making API requests to the backend.
  * **Socket.IO Client**: For real-time, bidirectional communication.

### Backend

  * **Node.js & Express.js**: The server-side environment and web framework.
  * **MongoDB & Mongoose**: The NoSQL database and its ODM for data modeling.
  * **JWT & bcrypt.js**: For secure authentication and password hashing.
  * **Multer**: A middleware for handling file uploads.
  * **Socket.IO**: For real-time server-side events.

### Tools

  * **Postman**: Used for testing all API endpoints.
  * **Nodemon**: For automatic server restarts during development.

-----

## Setup & Installation

Follow these steps to get a local copy of the project up and running.

### Prerequisites

  * Node.js (v14 or higher)
  * MongoDB (A local instance or a cloud service like MongoDB Atlas)

### 1\. Clone the Repository

```bash
git clone https://github.com/your-username/DevConnector.git
cd DevConnector
```

### 2\. Backend Setup

1.  Navigate into the `server` directory:
    ```bash
    cd server
    ```
2.  Install all backend dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory and add your configurations:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=a_long_random_string
    ```
4.  Start the backend server:
    ```bash
    npm run dev
    ```
    The server will run on `http://localhost:5000`.

### 3\. Frontend Setup

1.  Navigate into the `client` directory:
    ```bash
    cd ../client
    ```
2.  Install all frontend dependencies:
    ```bash
    npm install
    ```
3.  Start the React development server:
    ```bash
    npm start
    ```
    The app will open in your browser at `http://localhost:3000`.

-----

![alt text](<ScreenShots/Screenshot 2025-09-07 141334.png>)
![alt text](<ScreenShots/Screenshot 2025-09-07 141413.png>)
![alt text](<ScreenShots/Screenshot 2025-09-07 141642.png>)
![alt text](<ScreenShots/Screenshot 2025-09-07 141713.png>)
