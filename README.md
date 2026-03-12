# DevConnector — The Social Network for Developers

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-username/DevConnector)
[![MERN Stack](https://img.shields.io/badge/stack-MERN-blue)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 💡 What problem does this solve?

Developers often work in silos, making it difficult to find collaborators, showcase specialized skills, or get peer feedback in a structured way. **DevConnector** bridges this gap by providing a dedicate space where developers can:
- **Build a professional identity** that highlights both technical skills and real-world experience.
- **Connect with peers** through a social feed, following/follower logic, and real-time interactions.
- **Showcase proof of work** by integrating GitHub repositories directly into their profiles.

---

## 🛠 Tech Stack

| Frontend | Backend | Database | Tools |
| :--- | :--- | :--- | :--- |
| ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) | ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white) |
| ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) | ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) | ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white) | ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white) |

---

## 🚀 Key Features

*   **User Registration & Authentication**: Secure sign-up/login using **JWT** and **bcrypt.js**.
*   **User Profiles**: Dynamic profiles featuring bios, skills, experience, and GitHub integration.
*   **Post Management**: Full CRUD functionality with media support (Cloudinary integration).
*   **Real-time Interactions**: Live notifications and instant updates using **Socket.IO**.
*   **RESTful API**: Professionally audited endpoints following REST conventions (see [API.md](./API.md)).
*   **Agile Methodology**: Managed with feature branching and Conventional Commits (see [CONTRIBUTING.md](./CONTRIBUTING.md)).

---

## 📸 Screenshots

| Dashboard | User Profile | Post Feed |
| :---: | :---: | :---: |
| ![Dashboard](ScreenShots/Screenshot%202025-09-07%20141334.png) | ![Profile](ScreenShots/Screenshot%202025-09-07%20141642.png) | ![Feed](ScreenShots/Screenshot%202025-09-07%20141929.png) |

---

## 🤖 Future Improvements (GenAI & Beyond)

-   **AI-Powered Bio Suggestions**: Integrate a Generative AI feature (e.g., Gemini or OpenAI API) to help developers craft compelling bios based on their listed skills and experience.
-   **Automated Skill Tagging**: Use LLMs to analyze GitHub repository descriptions and automatically suggest relevant skill tags.
-   **Intelligent Feed Curation**: Implement a recommendation system to surface posts most relevant to a developer's tech stack.

---

## 📦 Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas or Local MongoDB
*   Cloudinary Account (for image uploads)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/DevConnector.git
cd DevConnector
# Install all dependencies
npm install
```

### 2. Configure Environment
Create a `.env` file in the `server` directory:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
```

### 3. Run Application
```bash
# Run server & client concurrently
npm run dev
```

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.
