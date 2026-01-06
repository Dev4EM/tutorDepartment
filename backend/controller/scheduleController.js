// controllers/scheduleController.js
const Schedule = require("../models/Schedule.js");
const { generateStatusByDate } = require("../utils/generateStatusByDate.js");

/**
 * CREATE TASK
 */
const createSchedule = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      createdBy,
      startDate,
      endDate,
      taskType,
    } = req.body;

    const statusByDate = generateStatusByDate(startDate, endDate);

    const task = await Schedule.create({
      title,
      description,
      assignedTo,
      createdBy,
      startDate,
      endDate,
      taskType,
      statusByDate,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET TASKS (BY USER + DATE RANGE)
 * Used for weekly calendar
 */
const getSchedules = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.startDate = { $lte: endDate };
      filter.endDate = { $gte: startDate };
    }

    const schedules = await Schedule.find(filter)
      .populate("assignedTo", "name userType")
      .populate("createdBy", "name");

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE TASK DETAILS OR DATES
 * Optionally update a single date's status
 */
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, date, status } = req.body;

    const task = await Schedule.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // ✅ Update general task fields
    if (title) task.title = title;
    if (description) task.description = description;

    // ✅ Update the date range if changed
    if (startDate && endDate) {
      task.startDate = startDate;
      task.endDate = endDate;

      // Merge existing status with newly generated dates
      const newStatusByDate = generateStatusByDate(startDate, endDate);
      for (const d of Object.keys(task.statusByDate)) {
        if (newStatusByDate[d] === undefined) continue; // remove old dates outside range
        newStatusByDate[d] = task.statusByDate[d]; // keep existing status
      }
      task.statusByDate = newStatusByDate;
    }

    // ✅ Update status for a specific date if provided
    if (date && status) {
      task.statusByDate.set(date, status);
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE STATUS FOR A SPECIFIC DATE
 */
const updateTaskStatusByDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, status } = req.body;

    const task = await Schedule.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.statusByDate.set(date, status);
    await task.save();

    res.json({ message: "Status updated", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getSchedulesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const filter = { assignedTo: userId };

    if (startDate && endDate) {
      filter.startDate = { $lte: endDate };
      filter.endDate = { $gte: startDate };
    }

    const schedules = await Schedule.find(filter)
      .populate("assignedTo", "name userType")
      .populate("createdBy", "name");

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * DELETE TASK OR DELETE SPECIFIC DATE
 */
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const task = await Schedule.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (date) {
      // Delete only the specific date
      if (task.statusByDate.has(date)) {
        task.statusByDate.delete(date);

        if (task.statusByDate.size === 0) {
          await Schedule.findByIdAndDelete(id);
          return res.json({ message: "Task deleted (all dates removed)" });
        } else {
          await task.save();
          return res.json({ message: `Task deleted for date ${date}` });
        }
      } else {
        return res.status(400).json({ message: `No task found for date ${date}` });
      }
    } else {
      // Delete entire schedule
      await Schedule.findByIdAndDelete(id);
      return res.json({ message: "Task deleted successfully" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/**
 * PATCH /api/schedules/:id/status
 * Frontend should call this with:
 * URL: /api/schedules/<taskId>/status
 * Body: { date: "2025-11-28", status: "completed" }
 */
const updateScheduleStatus = async (req, res) => {
  try {
    // 1️⃣ Task ID comes from frontend in the URL
    const { id } = req.params;

    // 2️⃣ Date and new status come from frontend in request body
    const { date, status } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Task ID is required in URL" });
    }
    if (!date || !status) {
      return res.status(400).json({ message: "Date and status are required in body" });
    }

    // 3️⃣ Find the task by ID
    const task = await Schedule.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // 4️⃣ Update the status for the specific date
    task.statusByDate.set(date, status);

    // 5️⃣ Save the task back to DB
    await task.save();

    // 6️⃣ Return updated task to frontend
    res.json({ message: "Task status updated", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  createSchedule,
  getSchedules,
  updateSchedule,
  updateTaskStatusByDate,
  deleteSchedule,
  updateScheduleStatus,
  getSchedulesByUserId

};
