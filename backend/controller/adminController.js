const User = require('../models/User');
const Task = require('../models/Task');
const Batch = require('../models/Batch');
const Schedule = require('../models/Schedule');
const Alert = require('../models/Alert');
const bcrypt = require('bcrypt');
const Curriculum = require('../models/Curriculum');
// Get all users
exports.createUser = async (req, res) => {
  const { firstName, lastName, workEmail, password, role = 'tutor', batchId } = req.body;

  // ✅ Step 1: Basic validation9
 if (!firstName?.trim() || !lastName?.trim() || !workEmail?.trim() || !password) {
  return res.status(400).json({ message: 'All required fields must be provided and valid.' });
}


  try {
    // ✅ Step 2: Check if email already exists
    const existingUser = await User.findOne({ workEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // ✅ Step 3: Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Step 4: Create user
    const user = new User({
      firstName,
      lastName,
      workEmail,
      password: hashedPassword,
      role,
      batch: batchId || null
    });

    await user.save();

    // ✅ Step 5: Optionally add user to batch
    if (batchId) {
      await Batch.findByIdAndUpdate(batchId, { $push: { members: user._id } });
    }

    res.status(201).json({ message: 'User created successfully', user });

  } catch (err) {
    // ✅ Step 6: Handle errors clearly
    // if (err.code === 11000) {
    //   return res.status(400).json({ message: 'Duplicate field error', error: err.keyValue });
    // }

    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};



exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // no populate here
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 🧠 Change user role (admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params; // user ID
    const { newRole } = req.body;

    // ✅ Validate allowed roles
    const allowedRoles = ["tutor", "teamLeader","admin"];
    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({
        message: "Invalid role. Only 'tutor' or 'teamLeader' are allowed.",
      });
    }

    // ✅ Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { userType: newRole },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: `User role updated successfully to '${newRole}'.`,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error changing user role:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getAllUserByBatch = async (req, res) => {
  try {
    const users = await User.find().populate('batch');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign a task to a user
exports.assignTask = async (req, res) => {
  const { userId, title, description, url, dueDate } = req.body;

  // ✅ Basic input validation
  if (!userId || !title || !dueDate) {
    return res.status(400).json({ message: 'userId, title, and dueDate are required.' });
  }

  try {
    const task = new Task({
      title,
      description,
      url,
      dueDate,
      assignedTo: userId,
      status: 'Pending'
    });

    await task.save();

    res.status(201).json({
      message: 'Task assigned successfully',
      task
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'firstName lastName workEmail'); // optional: populate user data
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get tasks for a specific user

exports.getTasksByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const tasks = await Task.find({ assignedTo: userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get task completion stats by user

exports.getUserTaskStats = async (req, res) => {
  try {
    const users = await User.find();
    const stats = await Promise.all(users.map(async (user) => {
      const completed = await Task.countDocuments({ assignedTo: user._id, completed: true });
      const total = await Task.countDocuments({ assignedTo: user._id });
      return {
        userId: user._id,
        name: `${user.firstName} ${user.lastName}`,
        completed,
        total
      };
    }));

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all batches
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find().populate('members');
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create or update a schedule
exports.createSchedule = async (req, res) => {
  const { title, description, date, isBookmarked, participants } = req.body;

  try {
    const schedule = new Schedule({
      title,
      description,
      date,
      isBookmarked,
      participants
    });

    await schedule.save();
    res.status(201).json({ message: 'Schedule created', schedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create alert
exports.createAlert = async (req, res) => {
  const { message, type, forAll } = req.body;

  try {
    const alert = new Alert({ message, type, forAll });
    await alert.save();
    res.status(201).json({ message: 'Alert created', alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all alerts
exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    // 🧩 1. Get user info
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🧩 2. Count number of curricula created by this user
    const curriculumCount = await Curriculum.countDocuments({ createdBy: userId });

    // 🧩 3. Count number of batches where user is currently assigned as tutor
    const assignedBatchesCount = await Batch.countDocuments({ tutor: userId });

    // 🧩 4. Find ongoing batch (if applicable)
    const ongoingBatch = await Batch.findOne({
      tutor: userId,
      status: "ongoing", // adjust based on your schema
    }).populate("curriculum tutor");

    // 🧩 5. Count pending tasks
    const pendingTasksCount = await Task.countDocuments({
      assignedTo: userId,
      status: "pending",
    });

    // 🧩 6. Find batches where user appears in tutorHistory
    const batchesWithHistory = await Batch.find({
      "tutorHistory.tutor": userId,
    })
      .populate([
        { path: "tutor", select: "name email" },
        { path: "curriculum", select: "title description" },
        { path: "tutorHistory.tutor", select: "name email" },
      ])
      .lean(); // return plain JS objects for easy filtering

    // 🧩 7. Filter tutorHistory to ensure the user appears only once per batch
    const uniqueHistoryBatches = batchesWithHistory.map((batch) => {
      const filteredHistory = batch.tutorHistory.filter(
        (entry, index, self) =>
          entry.tutor &&
          entry.tutor._id.toString() === userId &&
          index === self.findIndex(
            (h) => h.tutor && h.tutor._id.toString() === userId
          )
      );

      return {
        _id: batch._id,
        name: batch.name,
        project: batch.project,
        startDate: batch.startDate,
        endDate: batch.endDate,
        currentTutor: batch.tutor ? { _id: batch.tutor._id, name: batch.tutor.name } : null,
        curriculum: batch.curriculum
          ? { _id: batch.curriculum._id, title: batch.curriculum.title }
          : null,
        tutorHistory: filteredHistory.map((h) => ({
          tutor: { _id: h.tutor._id, name: h.tutor.name },
          changedAt: h.changedAt,
        })),
      };
    });

    // 🧩 8. Also include currently assigned batches (no duplicates)
    const currentBatches = await Batch.find({ tutor: userId })
      .populate([
        { path: "tutor", select: "name email" },
        { path: "curriculum", select: "title description" },
      ])
      .lean();

    const combinedBatches = [
      ...uniqueHistoryBatches,
      ...currentBatches.map((batch) => ({
        _id: batch._id,
        name: batch.name,
        project: batch.project,
        startDate: batch.startDate,
        endDate: batch.endDate,
        currentTutor: batch.tutor ? { _id: batch.tutor._id, name: batch.tutor.name } : null,
        curriculum: batch.curriculum
          ? { _id: batch.curriculum._id, title: batch.curriculum.title }
          : null,
        tutorHistory: batch.tutorHistory
          ? batch.tutorHistory.map((h) => ({
              tutor: { _id: h.tutor._id, name: h.tutor.name },
              changedAt: h.changedAt,
            }))
          : [],
      })),
    ];

    // 🧩 9. Remove duplicates (if user was in tutorHistory and is current tutor)
    const seen = new Set();
    const uniqueBatches = combinedBatches.filter((b) => {
      if (seen.has(b._id.toString())) return false;
      seen.add(b._id.toString());
      return true;
    });

    // 🧩 10. Send the response
    return res.status(200).json({
      user,
      stats: {
        curriculumCount,
        assignedBatchesCount,
        ongoingBatch: ongoingBatch || null,
        pendingTasksCount,
      },
      batches: uniqueBatches,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


