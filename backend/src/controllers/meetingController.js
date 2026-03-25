const meetingModel = require("../models/meetingModel");

const createMeeting = async (req, res) => {
  try {
    const { lesson_id, teacher_id, date } = req.body;
    const meeting = await meetingModel.createMeeting(lesson_id, teacher_id, date);
    res.status(201).json(meeting);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getMeetings = async (req, res) => {
  try {
    const meetings = await meetingModel.getMeetings();
    res.json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getMeetingById = async (req, res) => {
  try {
    const meeting = await meetingModel.getMeetingById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    res.json(meeting);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const updateMeeting = async (req, res) => {
  try {
    const { lesson_id, teacher_id, date } = req.body;
    const meeting = await meetingModel.updateMeeting(req.params.id, lesson_id, teacher_id, date);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    res.json(meeting);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const meeting = await meetingModel.deleteMeeting(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    res.json({ message: "Meeting deleted", meeting });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting
};