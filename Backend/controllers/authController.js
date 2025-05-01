import supabase from "../utils/supabaseClient.js";

const register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    res.status(201).json({
      message: "User registered successfully",
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    if (!data || !data.session) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const validateUser = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({
        valid: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      valid: true,
      user: data.user,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(401).json({
      valid: false,
      message: "Invalid token",
    });
  }
};

export { register, login, validateUser };
