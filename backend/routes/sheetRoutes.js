const express = require("express");
const router = express.Router();
const Sheet = require("../models/Sheet");

// 🧠 Create new sheet link
router.post("/", async (req, res) => {
  try {
    const { name, description, url, createdBy } = req.body;

    if (!name || !url || !createdBy) {
      return res.status(400).json({ message: "Name, URL and createdBy are required." });
    }

    const sheet = new Sheet({ name, description, url, createdBy });
    const saved = await sheet.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating sheet:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🧠 Get all sheets
router.get("/", async (req, res) => {
  try {
    const sheets = await Sheet.find()
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(sheets);
  } catch (err) {
    console.error("Error fetching sheets:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🧠 Get sheet by ID
router.get("/:id", async (req, res) => {
  try {
    const sheet = await Sheet.findById(req.params.id)
      .populate("createdBy", "firstName lastName email");

    if (!sheet) return res.status(404).json({ message: "Sheet not found" });

    res.json(sheet);
  } catch (err) {
    console.error("Error fetching sheet:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🧠 Update sheet
router.put("/:id", async (req, res) => {
  try {
    const { name, description, url } = req.body;

    const updated = await Sheet.findByIdAndUpdate(
      req.params.id,
      { name, description, url },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Sheet not found" });

    res.json(updated);
  } catch (err) {
    console.error("Error updating sheet:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🧠 Delete sheet
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Sheet.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Sheet not found" });

    res.json({ message: "Sheet deleted successfully" });
  } catch (err) {
    console.error("Error deleting sheet:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
