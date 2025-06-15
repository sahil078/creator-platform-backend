// models/Idea.js
const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema({
  topic: String,
  niche: String,
  reelIdea: String,
  caption: String,
  hashtags: [String],
  hook: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Idea', IdeaSchema);