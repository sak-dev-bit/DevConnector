const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
