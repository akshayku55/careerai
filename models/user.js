const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  career: {
    type: String,
    enum: [
      'Software Engineer', 
      'Data Scientist', 
      'UI/UX Designer',
      'Product Manager',
      'Cybersecurity Specialist'
    ],
    default: null
  },
  quizResults: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizResult'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  learningPath: {
    type: Array,
    default: []
  },
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});



module.exports = mongoose.model('User', userSchema);
