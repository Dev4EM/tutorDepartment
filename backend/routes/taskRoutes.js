const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// 🧠 Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, url, dueDate, assignedTo, createdBy } = req.body;

    if (!title || !dueDate || !assignedTo || !createdBy) {
      return res.status(400).json({ message: 'Title, dueDate, assignedTo, and createdBy are required.' });
    }

    const newTask = new Task({
      title,
      description,
      url,
      dueDate,
      assignedTo,
      createdBy
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: err.message });
  }
});

// 🧠 Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find()
      .select('title description url dueDate assignedTo createdAt createdBy status')
      .populate('assignedTo', 'firstName lastName workEmail userType')
      .populate('createdBy', 'firstName lastName workEmail userType');

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: err.message });
  }
});

// 🧠 Get a single task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .select('title description url dueDate assignedTo createdAt createdBy status')
      .populate('assignedTo', 'firstName lastName workEmail userType')
      .populate('createdBy', 'firstName lastName workEmail userType');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ message: err.message });
  }
});

// 🧠 Update task (title, description, url, dueDate, assignedTo, status)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, url, dueDate, assignedTo, status, createdBy } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, url, dueDate, assignedTo, status, createdBy },
      { new: true, runValidators: true }
    )
      .select('title description url dueDate assignedTo createdAt createdBy status')
      .populate('assignedTo', 'firstName lastName workEmail userType')
      .populate('createdBy', 'firstName lastName workEmail userType');

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: err.message });
  }
});

// 🧠 Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: err.message });
  }
});

// 🧠 Update task status only
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Incomplete', 'Complete'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .select('title description url dueDate assignedTo createdAt createdBy status')
      .populate('assignedTo', 'firstName lastName workEmail userType')
      .populate('createdBy', 'firstName lastName workEmail userType');

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
