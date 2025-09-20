const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../database');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Register new user
const register = async (req, res) => {
  try {
    const { 
      loginId, 
      email, 
      password, 
      firstName = 'User', 
      lastName = '', 
      position = 'Operator', 
      department = 'Manufacturing', 
      role = 'OPERATOR', 
      phone, 
      location, 
      bio 
    } = req.body;

    // Use email as primary identifier, fallback to loginId
    const userEmail = email || loginId;
    
    if (!userEmail || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Check if user already exists (by email)
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (existingUser) {
      return res.status(409).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with defaults
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        firstName,
        lastName,
        position,
        department,
        role,
        phone,
        location,
        bio,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        role: true,
        joinDate: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please login.',
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed',
      error: error.message 
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, loginId, password } = req.body;

    // Use email or loginId for login
    const identifier = email || loginId;
    
    if (!identifier) {
      return res.status(400).json({ 
        error: 'Email or loginId is required' 
      });
    }

    // Find user by email (since our schema uses email as unique)
    const user = await prisma.user.findUnique({
      where: { email: identifier },
      include: {
        certifications: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Log activity (create table if doesn't exist)
    try {
      await prisma.userActivity.create({
        data: {
          type: 'user_login',
          description: 'User logged in successfully',
          userId: user.id,
        },
      });
    } catch (activityError) {
      console.log('Could not log activity:', activityError.message);
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message 
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        certifications: {
          orderBy: { issueDate: 'desc' },
        },
        activities: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
        manufacturingOrders: {
          where: { status: { in: ['PLANNED', 'IN_PROGRESS'] } },
          include: {
            product: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        workOrders: {
          where: { status: { in: ['PENDING', 'STARTED', 'PAUSED'] } },
          include: {
            manufacturingOrder: {
              include: { product: { select: { name: true } } },
            },
            workCenter: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userProfile } = user;

    res.json(userProfile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, position, department, location, bio, skills } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
        position,
        department,
        location,
        bio,
        skills,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        position: true,
        department: true,
        location: true,
        bio: true,
        skills: true,
        role: true,
        joinDate: true,
        updatedAt: true,
      },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'profile_updated',
        description: 'User profile updated',
        userId: req.user.id,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        type: 'password_changed',
        description: 'User password changed',
        userId: req.user.id,
      },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};
