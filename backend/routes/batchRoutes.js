// routes/batch.js
const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Tutor = require('../models/User');

// 🧠 Get all batches
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('curriculum')
      .populate('tutor');
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🧠 Create batch
router.post('/', async (req, res) => {
  try {
    const batch = new Batch(req.body);
    const saved = await batch.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 🧠 Update batch (progress or completed activities)
router.put('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    // ✅ Handle tutor change and track history
    if (req.body.tutor && req.body.tutor.toString() !== batch.tutor?.toString()) {
      if (batch.tutor) {
        batch.tutorHistory.push({ tutor: batch.tutor });
      }
      batch.tutor = req.body.tutor;
    }

    // ✅ Dynamically update allowed fields
    const updatableFields = [
      'name',
      'curriculum',
      'project',
      'startDate',
      'endDate',
      'activitiesDoneByType',
      'progressByType',
      'unlockedPackages',
    ];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        batch[field] = req.body[field];
      }
    });

    const updatedBatch = await batch.save();

    // ✅ Modern Mongoose populate (no execPopulate)
    await updatedBatch.populate([
      { path: 'tutor' },
      { path: 'tutorHistory.tutor' },
    ]);

    res.json(updatedBatch);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// 🧠 Delete batch
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Batch.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Batch not found' });
    res.json({ message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🧠 Get a batch by ID
router.get('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('curriculum')
      .populate('tutor');
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET tasks assigned to a specific tutor
router.get('/tutor/:tutorId', async (req, res) => {
  try {
    const { tutorId } = req.params;

    const tasks = await Task.find({ assignedTo: tutorId })
      .populate('assignedTo', 'firstName lastName workEmail userType')
      .populate('assignedBy', 'firstName lastName workEmail userType'); // shows who assigned

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tutor tasks:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
