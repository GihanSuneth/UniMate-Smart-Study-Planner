const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  portalId: {
    type: String,
    unique: true,
    index: true,
  },
  fullName: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String, // Store as Base64 string
    default: '',
  },
  role: {
    type: String,
    enum: ['student', 'Lecturer', 'admin'],
    default: 'student',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() {
      // Admins are approved by default, others need approval
      return this.role === 'admin' ? 'approved' : 'pending';
    },
  },
  assignedModules: [{
    type: String, // 'Programming Applications', 'Database Systems', etc.
  }],
  academicYear: {
    type: String, // "Year 1", "Year 2", etc.
    default: '',
  },
  semester: {
    type: String, // "Semester 1", "Semester 2", etc.
    default: '',
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
});

// Generate portalId and Hash password before saving
userSchema.pre('save', async function() {
  // 1. Generate Portal ID if missing
  if (!this.portalId) {
    const rolePrefix = this.role === 'Lecturer' ? 'L' : this.role === 'admin' ? 'A' : 'S';
    const lastUser = await this.constructor.findOne({ portalId: new RegExp(`^${rolePrefix}`) }, { portalId: 1 }).sort({ portalId: -1 });
    
    let nextNum = 1001;
    if (lastUser && lastUser.portalId) {
      const currentNum = parseInt(lastUser.portalId.substring(1));
      if (!isNaN(currentNum)) nextNum = currentNum + 1;
    }
    this.portalId = `${rolePrefix}${nextNum}`;
  }

  // 2. Hash password
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
