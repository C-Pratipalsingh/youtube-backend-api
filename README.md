# YouTube Backend API

A robust and scalable backend API for a video hosting platform, built with Node.js, Express, and MongoDB. This project provides a comprehensive set of features including user authentication, video management, tweet-like posts, subscriptions, playlists, likes, comments, and a dashboard for analytics.

## 🚀 Features

- **User Authentication**: Secure sign-up, login, logout, and refresh token mechanisms using JWT and Bcrypt.
- **Video Management**: Upload, publish, edit, and delete videos. Cloudinary integration for storage.
- **Tweet System**: Create and manage text-based posts.
- **Subscriptions**: Subscribe to channels and view subscriber lists.
- **Playlists**: Create and manage video playlists.
- **Likes & Comments**: Like videos/tweets/comments and add comments.
- **Dashboard**: View channel statistics (views, subscribers, videos, likes).
- **History**: Track user watch history.
- **Health Check**: API health monitoring endpoint.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Managed via Mongoose)
- **Cloud Storage**: [Cloudinary](https://cloudinary.com/) (For images and videos)
- **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/)
- **Password Hashing**: [Bcrypt](https://www.npmjs.com/package/bcrypt)
- **File Uploads**: [Multer](https://www.npmjs.com/package/multer)

## 📂 Project Structure

```
youtube-backend-api/
├── src/
│   ├── controllers/    # Request handlers
│   ├── db/             # Database connection logic
│   ├── middlewares/    # Custom middlewares
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   ├── app.js          # App setup
│   ├── constants.js    # Application constants
│   └── index.js        # Entry point
├── package.json        # Dependencies and scripts
└── ...
```

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- An [Cloudinary](https://cloudinary.com/) account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/C-Pratipalsingh/youtube-backend-api.git
   cd youtube-backend-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add the following variables:

   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=*
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

### Running the Application

- **Development Mode**:
  ```bash
  npm run dev
  ```

The server will start on `http://localhost:8000/` (or your defined PORT).

## 📡 API Endpoints

### Users
- `/api/v1/users` - User registration, login, profile management, history.

### Videos
- `/api/v1/videos` - Video upload, retrieval, and management.

### Tweets
- `/api/v1/tweets` - Tweet management.

### Subscriptions
- `/api/v1/subscriptions` - Subscription management.

### Playlists
- `/api/v1/playlists` - Playlist management.

### Comments
- `/api/v1/comments` - Comment videos.

### Likes
- `/api/v1/likes` - Like/unlike functionality.

### Dashboard
- `/api/v1/dashboard` - Channel analytics.

### Health Check
- `/api/v1/healthcheck` - Server health status.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the ISC License.