const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const authController=require('../middleware/authMiddleware')

// Get all users
router.get('/users',authController, adminController.getAllUsers);


router.post('/users/create',authController, adminController.createUser);

// Assign task
router.post('/tasks/assign',authController, adminController.assignTask);
router.get('/tasks',authController, adminController.getAllTasks);
router.get('/tasks/:id',authController, adminController.getTasksByUser);
router.put('/changeRole/:id',authController, adminController.changeUserRole);

// Task stats
router.get('/tasks/stats',authController, adminController.getUserTaskStats);
// Batches
router.get('/batches',authController, adminController.getAllBatches);

// Create schedule
router.post('/schedule',authController, adminController.createSchedule);

// Create & get alerts
router.post('/alerts',authController, adminController.createAlert);
router.get('/alerts',authController, adminController.getAllAlerts);
router.get('/userDetails/:id',authController,adminController.getUserDetails)
module.exports = router;
