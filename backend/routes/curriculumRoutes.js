const express = require("express");
const router = express.Router();
const Curriculum = require("../models/Curriculum");

// 🧠 Create new curriculum
router.post("/", async (req, res) => {
  try {
    let { title, columns, rows, createdBy } = req.body;

    if (typeof rows === "string") {
      try {
        rows = JSON.parse(rows);
      } catch (err) {
        console.error("❌ Failed to parse rows:", err);
        return res.status(400).json({ message: "Invalid rows format" });
      }
    }

    const curriculum = new Curriculum({ title, columns, rows, createdBy });
    await curriculum.save();

    res.status(201).json({
      message: "Curriculum saved successfully",
      curriculum,
    });
  } catch (error) {
    console.error("❌ Error saving curriculum:", error);
    res.status(400).json({ message: error.message });
  }
});

// 🧠 Fetch all curriculums
router.get("/", async (req, res) => {
  try {
    const curriculums = await Curriculum.find();
    res.json(curriculums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🧠 Fetch a curriculum by ID
// 🧠 Fetch all curriculums (only id and title)
router.get("/list", async (req, res) => {
  try {
    const curriculums = await Curriculum.find({}, { _id: 1, title: 1 }); // Only select _id and title
    res.json(curriculums);
  } catch (error) {
    console.error("❌ Error fetching curriculum list:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🧠 Fetch a curriculum by ID
router.get("/:id", async (req, res) => {
  try {
    const curriculum = await Curriculum.findById(req.params.id);
    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }
    res.json(curriculum);
  } catch (error) {
    console.error("❌ Error fetching curriculum by ID:", error);
    res.status(500).json({ message: error.message });
  }
});


// 🧠 Update a curriculum by ID
router.put("/:id", async (req, res) => {
  try {
    let { title, columns, rows } = req.body;

    if (typeof rows === "string") {
      try {
        rows = JSON.parse(rows);
      } catch (err) {
        console.error("❌ Failed to parse rows:", err);
        return res.status(400).json({ message: "Invalid rows format" });
      }
    }

    const updatedCurriculum = await Curriculum.findByIdAndUpdate(
      req.params.id,
      { title, columns, rows },
      { new: true, runValidators: true }
    );

    if (!updatedCurriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    res.json({
      message: "Curriculum updated successfully",
      curriculum: updatedCurriculum,
    });
  } catch (error) {
    console.error("❌ Error updating curriculum:", error);
    res.status(400).json({ message: error.message });
  }
});
// 🧠 Delete a curriculum by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedCurriculum = await Curriculum.findByIdAndDelete(req.params.id);

    if (!deletedCurriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    res.json({
      message: "Curriculum deleted successfully",
      curriculum: deletedCurriculum,
    });
  } catch (error) {
    console.error("❌ Error deleting curriculum:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
