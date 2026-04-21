const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'unimate_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role || 'student',
      status: role === 'admin' ? 'approved' : 'pending',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        portalId: user.portalId,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        message: 'Registration successful. Waiting for admin approval.',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username, email, or portalId
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username },
        { portalId: username }
      ]
    });

    if (user && (await user.comparePassword(password))) {
      if (user.status !== 'approved') {
        return res.status(401).json({ message: 'Account pending approval by portal admin' });
      }

      // Update lastLogin
      user.lastLogin = new Date();
      await user.save();

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a user (Admin only)
// @route   PUT /api/auth/approve/:id
// @access  Private/Admin
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (user) {
      res.json({ message: 'User approved successfully', user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a user (Admin only)
// @route   PUT /api/auth/reject/:id
// @access  Private/Admin
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (user) {
      res.json({ message: 'User rejected successfully', user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      // 🚀 Auto-allocation for Demo Sustainability
      const coreModules = [
        'Network Design and Modeling', 
        'Database System', 
        'Operating Systems', 
        'Data Structures and Algorithms', 
        'Data Science and Analytics'
      ];

      let changed = false;

      if (user.role === 'student') {
        // Enforce 3rd Year, 2nd Sem if not set
        if (!user.academicYear || user.academicYear === '') {
          user.academicYear = '3rd Year';
          changed = true;
        }
        if (!user.semester || user.semester === '') {
          user.semester = '2nd Semester';
          changed = true;
        }
        // Enforce all 5 modules if list is empty
        if (!user.enrolledModules || user.enrolledModules.length === 0) {
          user.enrolledModules = coreModules;
          changed = true;
        }
      } else if (user.role && user.role.toLowerCase() === 'lecturer') {
        // Enforce modules for lecturers if list is empty
        if (!user.assignedModules || user.assignedModules.length === 0) {
          user.assignedModules = [coreModules[0], coreModules[1]]; // Assign Network Design and Database System
          changed = true;
        }
      }

      if (changed) {
        await user.save();
        console.log(`[Auto-Allocation] Updated profile for ${user.username} (${user.role})`);
      }

      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      if (req.body.profilePic) {
        user.profilePic = req.body.profilePic;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePic: updatedUser.profilePic,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/change-password
// @access  Private
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user && (await user.comparePassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ status: -1 }); 
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update or create users (Admin only)
// @route   POST /api/auth/bulk-update
// @access  Private/Admin
exports.bulkUpdateUsers = async (req, res) => {
  const { users } = req.body;

  if (!Array.isArray(users)) {
    return res.status(400).json({ message: 'Invalid data format. Expected an array of users.' });
  }

  try {
    const results = { created: 0, updated: 0, errors: [] };

    for (const userData of users) {
      const { username, email, role, assignedModules, academicYear, semester, password: incomingPassword } = userData;

      try {
        let user = await User.findOne({ username });

        if (user) {
          // Update existing user
          user.email = email || user.email;
          user.role = role || user.role;
          if (assignedModules) user.assignedModules = assignedModules;
          if (academicYear) user.academicYear = academicYear;
          if (semester) user.semester = semester;
          
          // Set temporary password based on portalId
          const tempPwd = user.portalId.toLowerCase() + user.portalId.toLowerCase();
          user.password = incomingPassword || tempPwd;
          
          await user.save();
          results.updated++;
        } else {
          // Create new user - temporarily set a placeholder to trigger pre-save hook
          user = new User({
            username,
            email,
            password: 'placeholder', 
            role: role || 'student',
            assignedModules: assignedModules || [],
            academicYear: academicYear || '',
            semester: semester || '',
            status: 'approved'
          });
          
          // Save once to generate portalId
          await user.save();
          
          // Now set the actual password based on the generated portalId
          const tempPwd = user.portalId.toLowerCase() + user.portalId.toLowerCase();
          user.password = incomingPassword || tempPwd;
          await user.save(); // Save again to hash the real password
          
          results.created++;
        }
      } catch (err) {
        results.errors.push({ username, error: err.message });
      }
    }

    res.json({ message: 'Bulk operation completed', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/auth/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete.role === 'admin') {
      return res.status(403).json({ message: 'Admin users cannot be deleted for safety.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user details by Admin
// @route   PUT /api/auth/admin/update/:id
// @access  Private/Admin
exports.adminUpdateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = req.body.role || user.role;
      user.assignedModules = req.body.assignedModules || user.assignedModules;
      user.academicYear = req.body.academicYear || user.academicYear;
      user.semester = req.body.semester || user.semester;
      user.status = req.body.status || user.status;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify admin/lecturer password for re-authentication
// @route   POST /api/auth/verify-password
// @access  Private
exports.verifyPassword = async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      res.json({ success: true, message: 'Password verified' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Reset user password by Admin
// @route   PUT /api/auth/admin/reset-password/:id
// @access  Private/Admin
exports.resetUserPassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword; // Pre-save hook will hash it
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get students filtered by assigned module
// @route   GET /api/auth/students
// @access  Private (Lecturer/Admin)
exports.getStudentsByModule = async (req, res) => {
  const { module } = req.query;
  try {
    const filter = { role: 'student' };
    if (module) {
      filter.assignedModules = { $in: [module] };
    }
    const students = await User.find(filter).select('username email portalId academicYear semester status');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lookup Portal ID by email
// @route   POST /api/auth/portal-id-lookup
// @access  Public
exports.lookupPortalId = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    res.json({ 
      success: true, 
      portalId: user.portalId,
      username: user.username 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
