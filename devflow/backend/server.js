require('dotenv').config();
const express = require('express');
const axios = require('axios'); 
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path'); 

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'SUPER_SECRET_KEY';

app.use(cors()); 
app.use(express.json()); 

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB LESSS GOOO!!');
    seedDatabase();
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- SCHEMAS ---
const projectSchema = new mongoose.Schema({
  title: String,
  repoName: String,  
  desc: String,
  clicks: { type: Number, default: 0 },
  color: String,
  techStack: [String], 
  imageUrl: String,
  year: String, 
  role: String,
  githubUrl: String,
  tasks: {
    ideas: { type: [String], default: [] },
    doing: { type: [String], default: [] },
    review: { type: [String], default: [] }
  }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Project = mongoose.model('Project', projectSchema);
const User = mongoose.model('User', userSchema);

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid Token' });
  }
};

// --- API ROUTES ---

// github_proxy.php replacement
app.get('/api/github-proxy', async (req, res) => {
  const { repo } = req.query; 
  try {
    const response = await axios.get(`https://api.github.com/repos/${repo}/commits`, {
      headers: { 'User-Agent': 'node.js' }
    });
    res.json(response.data);
  } catch (error) {
    console.error("GitHub API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch GitHub commits' });
  }
});

//  get_activity.php replacement 
app.get('/api/github-activity', async (req, res) => {
  try {
    const response = await axios.get(`https://api.github.com/users/Nicolatian/events`, {
      headers: { 'User-Agent': 'node.js' }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

app.get('/api/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Invalid ID format" });
  }
});

app.patch('/api/projects/:id/click', async (req, res) => {
  const updated = await Project.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } }, { returnDocument: 'after'});
  res.json(updated);
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '7d' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => { 
  const newProject = new Project(req.body);
  const saved = await newProject.save();
  res.status(201).json(saved);
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => { 
  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
  res.json(updated);
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => { 
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project deleted' });
});



// --- SEED DATABASE ---
async function seedDatabase() {
  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.create([{ 
      title: 'My Portfolio', 
      repoName: 'DevFlow',
      desc: 'Built with MEAN Stack', 
      techStack: ['angular', 'mongodb', 'nodejs', 'express'],
      role: 'Full Stack Developer',
      year: '2026'
    }]);
  }
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password: hashedPassword });
  }
}

app.listen(PORT, () => console.log(`Backend Active on Port ${PORT}`));