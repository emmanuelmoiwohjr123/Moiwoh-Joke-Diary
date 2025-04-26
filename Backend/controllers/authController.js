import User from "../models/Signup.js";
import bcrypt from "bcrypt";

export const signUp = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Checking for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create the user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create session
    req.session.userId = newUser.id;
    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session error" });
      }

      console.log("User created and session established");
      res.status(201).json({ 
        message: "User created successfully", 
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
          // Don't send back password or sensitive data
        } 
      });
    });

  } catch (error) {
    console.error("Failed to create user:", error);
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" }); // Generic message for security
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create session
    req.session.userId = user.id;
    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session error" });
      }

      console.log("User logged in successfully");
      res.status(200).json({ 
        message: "User logged in successfully", 
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    });

  } catch (error) {
    console.error("Failed to login:", error);
    res.status(500).json({ message: "Failed to login", error: error.message });
  }
};

export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    
    res.clearCookie('connect.sid');
    console.log("User logged out successfully");
    res.status(200).json({ message: "Logged out successfully" });
  });
};

export const checkAuth = (req, res) => {
  if (req.session.userId) {
    return res.status(200).json({ 
      authenticated: true,
      message: "User is authenticated"
    });
  }
  res.status(200).json({ 
    authenticated: false,
    message: "User is not authenticated"
  });
};