const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to receive alert data
app.post('/send-alert', upload.fields([{ name: 'audio' }, { name: 'video' }]), (req, res) => {
  const { latitude, longitude } = req.body;
  console.log('Alert received!');
  console.log(`Location: Latitude ${latitude}, Longitude ${longitude}`);
  if (req.files.audio) {
    console.log('Audio file received:', req.files.audio[0].originalname);
  }
  if (req.files.video) {
    console.log('Video file received:', req.files.video[0].originalname);
  }
  // Mock sending to emergency contacts
  console.log('Mock: Sending alert to emergency contacts...');
  res.json({ message: 'Alert sent successfully!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
