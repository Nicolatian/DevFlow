require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'SUPER_SECRET_KEY';

app.use(cors()); 
app.use(express.json()); 

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('YEEESSSSS Connected to MongoDB!!!!');
    seedDatabase();
  })
  .catch(err => console.error('NEEEEEEEJJJJJ!!!! MongoDB Connection Error:', err));

// --- SCHEMAS ---
const projectSchema = new mongoose.Schema({
  title: String,
  desc: String,
  clicks: { type: Number, default: 0 },
  color: String,
  imageUrl: String,
  tasks: { type: [String], default: [] } 
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Project = mongoose.model('Project', projectSchema);
const User = mongoose.model('User', userSchema);

// --- AUTH MIDDLEWARE (THE GUARD) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer TOKEN"

  if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};

// --- SEED DATABASE ---
async function seedDatabase() {
  try {
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.create([
        { title: 'My Portfolio', desc: 'Built with MEAN Stack', clicks: 5, color: '#47A248' },
        { title: 'Kanban Board', desc: 'Manage your daily tasks', clicks: 12, color: '#007bff' }
      ]);
      console.log('!!! Database seeded with starter projects!');
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({ username: 'admin', password: hashedPassword });
      console.log('!!! Admin user created: admin / admin123');
    }
  } catch (err) {
    console.error("Seed error:", err);
  }
}

// --- PUBLIC ROUTES (ANYONE CAN SEE) ---
app.get('/', (req, res) => res.send('Backend Server is Running!'));

app.get('/api/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.get('/api/projects/:id', async (req, res) => {
  const project = await Project.findById(req.params.id);
  res.json(project);
});

app.patch('/api/projects/:id/click', async (req, res) => {
  const updated = await Project.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } }, { new: true });
  res.json(updated);
});

// --- LOGIN ROUTE (THE KEY GENERATOR) ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// --- PROTECTED ROUTES (LOCK SYMBOL 🔒) ---
app.post('/api/projects', authenticateToken, async (req, res) => { 
  const newProject = new Project(req.body);
  const saved = await newProject.save();
  res.status(201).json(saved);
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => { 
  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => { 
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project deleted' });
});

// --- START ---
app.listen(PORT, () => console.log(`SERVER START at: http://localhost:${PORT}`));