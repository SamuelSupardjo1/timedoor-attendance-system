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

module.exports = {
  createMeeting,
  getMeetings
};