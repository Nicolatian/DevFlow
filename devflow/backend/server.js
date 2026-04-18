const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json()); 

// This connects to a local database named 'devflow'
mongoose.connect('mongodb://127.0.0.1:27017/devflow')
  .then(() => {
    console.log('YEEESSSSS Connected to MongoDB!!!!');
    seedDatabase();
  })
  .catch(err => console.error('NEEEEEEEJJJJJ!!!! MongoDB Connection Error:', err));

// This defines a "Project" is
const projectSchema = new mongoose.Schema({
  title: String,
  desc: String,
  clicks: { type: Number, default: 0 },
  color: String,
  imageUrl: String
});

const Project = mongoose.model('Project', projectSchema);

// This adds two projects to your database if it is currently empty 
async function seedDatabase() {
  try {
    const count = await Project.countDocuments();
    console.log("Current project count in DB:", count); 

    if (count === 0) {
      await Project.create([
        { title: 'My Portfolio', desc: 'Built with MEAN Stack', clicks: 5, color: '#47A248' },
        { title: 'Kanban Board', desc: 'Manage your daily tasks', clicks: 12, color: '#007bff' }
      ]);
      console.log('!!! Database seeded with starter projects!');
    }
  } catch (err) {
    console.error("Seed error:", err);
  }
}


// Home route, vibe check
app.get('/', (req, res) => {
  res.send('Backend Server is Running!');
});

// GET all projects from MongoDB
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET project based of ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH the click counter
app.patch('/api/projects/:id/click', async (req, res) => {
  try {
    // MongoDB uses _id.
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { returnDocument: 'after' }
    );

    if (updatedProject) {
      res.json({ success: true, newCount: updatedProject.clicks });
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ROUTE: Create a new project
app.post('/api/projects', async (req, res) => {
  try {
    const newProject = new Project(req.body); 
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE a project (The Edit)
app.put('/api/projects/:id', async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`SERVER START at: http://localhost:${PORT}`);
});