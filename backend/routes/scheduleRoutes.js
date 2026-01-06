// routes/scheduleRoutes.js
const express = require("express");
const {
  createSchedule,
  getSchedules,
  updateSchedule,
  updateTaskStatusByDate,
  deleteSchedule,
  updateScheduleStatus,
  getSchedulesByUserId
} = require("../controller/scheduleController.js"); // make sure folder name matches

const router = express.Router();

router.post("/", createSchedule);                   // CREATE
router.get("/", getSchedules);                      // READ (week/day)
router.put("/:id", updateSchedule);                // UPDATE task
router.patch("/:id/status", updateTaskStatusByDate); // UPDATE daily status
router.delete("/:id", deleteSchedule);             // DELETE
router.patch("/:id/status-update", updateScheduleStatus); 
router.get("/user/:userId", getSchedulesByUserId);

module.exports = router;
