const mongoose = require('mongoose');
const { Schema } = mongoose;

const QuizResultSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ type: String }],  // array of chosen answers
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);
