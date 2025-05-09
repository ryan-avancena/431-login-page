// SETUP STATEMENTS (DO NOT MODIFY)
import express from 'express';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';


const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json());
// app.use(express.static(join(__dirname, '_server')));

/* added by me */
import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();
const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
app.use(session({
  secret: 'replace-this-with-a-secure-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,            // can't be accessed by JS (secure)
    maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 days
    sameSite: 'lax',           // or 'strict' depending on use case
    secure: false              // true if using HTTPS
  }
}));

import multer from 'multer';
import fs from 'fs';

// Set up multer to save images as .jpg files in the uploads directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(__dirname, 'images');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}.jpg`; // Ensure the file is saved with a .jpg extension
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit (you can adjust as needed)
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'image/jpeg') {
      return cb(new Error('Only .jpg files are allowed'), false);
    }
    cb(null, true);
  }
});

// Profile image upload route
app.post('/api/upload-profile-image', upload.single('profile_img'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // The uploaded file is saved in the 'uploads' folder
  const imagePath = `/images/${req.file.filename}`;
  console.log(imagePath)
  res.status(200).json({ message: 'Profile image uploaded successfully', imagePath });
});

/* break */

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`mongodb+srv://${username}:${password}@firstcluster.lldns.mongodb.net/?retryWrites=true&w=majority&appName=FirstCluster`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
)();

// END SETUP STATEMENTS

// HANDLERS

import { loginUser } from './_handlers/loginUser.mjs';
import { logoutUser } from './_handlers/logoutUser.mjs';
import { registerUser } from './_handlers/registerUser.mjs';
import { getUser, getUserCollection} from './_handlers/getUser.mjs';
import { updateUser } from './_handlers/updateUser.mjs';
// import { deleteUser } from './_handlers/deleteUser.mjs';

// END HANDLERS


// API ROUTES (DO NOT MODIFY)
app.post('/api/login', loginUser);
app.post('/api/logout', logoutUser);
app.post('/api/register', registerUser);
// app.get('/api/user/:id', getUserCollection);
app.get('/api/user/:id', getUser);
app.put('/api/user/:id', updateUser);
// app.delete('/api/user/:id', deleteUser);
//END API ROUTES


  
app.get('/api/session', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  res.json({ userId: req.session.userId });
});

// HTML PAGE ROUTES

// // Serve static files from the client directory
// // This is the path to the client directory where your HTML files are located
// // This is setup so your "client" folder is next to your "_server" folder and not inside it
const clientPath = join(__dirname, '..', 'client');
app.use(express.static(clientPath));
app.use('/client-images', express.static(join(__dirname, '..', 'client', 'images')));
console.log('Serving static images from:', join(__dirname, '..', 'client', 'images'));

// Default "index" route
app.get('/', (req, res) => {
  res.sendFile(join(clientPath, 'html', 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

// app.get('/api/hello', (req, res) => {
//     res.json({ message: 'Hello from the server!' });
// });

// All other pages
app.get('/:pageName', (req, res) => {
  const filePath = join(clientPath, 'html', `${req.params.pageName}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});