const express = require("express");
const Program = require("../models/Program");

const router = express.Router();

/* ------------------------------
   📥 CREATE (POST)
--------------------------------*/
router.post("/", async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Calculate duration
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    const duration = `${diff} day${diff > 1 ? "s" : ""}`;

    const newProgram = await Program.create({
      name,
      description,
      startDate,
      endDate,
      duration,
    });

    res.status(201).json(newProgram);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ------------------------------
   📄 GET ALL
--------------------------------*/
router.get("/", async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ------------------------------
   🔍 GET BY ID
--------------------------------*/
router.get("/:id", async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ------------------------------
   ✏️ UPDATE (PUT)
--------------------------------*/
router.put("/:id", async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    const duration = `${diff} day${diff > 1 ? "s" : ""}`;

    const updatedProgram = await Program.findByIdAndUpdate(
      req.params.id,
      { name, description, startDate, endDate, duration },
      { new: true }
    );

    if (!updatedProgram)
      return res.status(404).json({ message: "Program not found" });

    res.json(updatedProgram);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ------------------------------
   ❌ DELETE
--------------------------------*/
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Program.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Program not found" });
    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
