import supabase from '../utils/supabaseClient.js';

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract Bearer token

  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  const { data: user, error } = await supabase.auth.getUser(token);

  if (error || !user) return res.status(403).json({ error: 'Invalid or expired token' });

  req.user = user.user; // Attach user data to request object
  next();
};

export default authMiddleware;
