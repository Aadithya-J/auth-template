
import supabase from "../utils/supabaseClient.js";
import getUser from "../utils/getUser.js";
// Add a new child for a teacher
export async function addChild(req, res) {
  const { name, rollno, age } = req.body;
  const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers['authorization']?.split(' ')[1]);
if (userError || !user) return res.status(401).json({ message: "User not authenticated" });

const teacherId = user.id;
console.log(user);
console.log(teacherId);
const { data, error } = await supabase.from('children').insert([
  { name, rollno, age, teacher_id: teacherId }
]).select();
if (error) {
  console.error("Error inserting child:", error);
  return res.status(500).json({ message: "Error inserting child", error });
}

console.log("Inserted child data:", data);
res.status(201).json({ message: "Child added successfully", data });
}

// Get a specific child with the number of tests taken
export async function getChild(req, res) {
  const { childId } = req.params; // Extract childId from the request body

  try {
    const {data:child,error}=await supabase.from('children').select("*").eq('id',childId).single();
    if(error){throw error;}
    res.status(200).json({ child });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

// Get all children for a specific teacher
export async function getChildrenByTeacher(req, res) {
  const teacherId = req.userId;

  try {
    const {data:children,error}=await supabase.from('children').select("*").eq('teacher_id',teacherId);
    res.status(200).json({ children });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}
