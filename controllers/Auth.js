const Wallet = require('../models/Wallet');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const asyncHandler = require('../middlewares/asyncHandler');
const jwt = require("jsonwebtoken");


// Create a new User with Wallet
exports.createUser = asyncHandler(async (req, res) => {

  const { name, email, password, role , state ,  address} = req.body.formData;

  // Check if all required fields are present
  if (!name || !email || !password || !role || !state || !address) {
    return res.status(400).json({ msg: "Please provide all required fields" });
  }

  // Check if the user already exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ msg: "User already exists" });
  }

  // Hash the password before saving
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new user
  user = new User({
    name,
    email,
    password: hashedPassword,
    role,
    state,  
    address
  });

  await user.save();

  // Create a Wallet for the User
  const wallet = new Wallet({
    user: user._id,
    lockedFund: 0,  // Initial fund amounts
    rotationalFund: 0
  });

  await wallet.save();

  const stockists = await User.find({role: "stockist"});
  res.status(201).json({ user, wallet , stockists, message: "Stockist Registered successfully"});
});



// Get all users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});




exports.getUserById = asyncHandler(async (req, res) => {
  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ msg: "Invalid user ID" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  res.status(200).json(user);
});



// Update user by ID
exports.updateUser = asyncHandler(async (req, res) => {
  const { name, email, password, funds, role } = req.body;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ msg: "Invalid user ID" });
  }

  // Check if the user exists
  let user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  // Check if at least one field is provided to update
  if (!name && !email && !password && !funds && !role) {
    return res.status(400).json({ msg: "No fields provided to update" });
  }

  // Update user fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (funds) user.funds = funds;
  if (role) user.role = role;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();
  res.status(200).json(user);
});




// Delete user by ID
exports.deleteUser = asyncHandler(async (req, res) => {
  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ msg: "Invalid user ID" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  await user.remove();
  res.status(200).json({ msg: "User deleted successfully" });
});








// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};


// Login User
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({ msg: "Please provide email and password" });
  }

  // Check if the user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(400).json({ msg: "Invalid credentials" });
  }

  // Check if the password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ msg: "Invalid credentials" });
  }

  // Generate a token and store it in a cookie
  const token = generateToken(user);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000 // 1 hour
  });

  res.status(200).json({
    msg: "Logged in successfully",
    user
  });
});




// Load User - Keep user logged in
exports.loadUser = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password'); // Omit password in the response

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    return res.status(401).json({ msg: "Token is invalid" });
  }
});




// Logout User
exports.logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.status(200).json({ msg: "Logged out successfully" });
});

