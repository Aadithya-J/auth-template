import supabase from '../utils/supabaseClient.js';

export async function addSequenceTest(req, res) {
    const { userId, email, score, totalQuestions, percentage, timestamp } = req.body;
    console.log("Details sent to backend are: " , userId, email, score, totalQuestions, percentage, timestamp);
    try {

        const { data, error } = await supabase
            .from('sequence_test_results')
            .insert([{ 
                user_id: userId,
                email,
                score,
                total_questions: totalQuestions,
                percentage,
                timestamp
            }])
            .select('*');
        
        if (error) throw error;
        
        res.status(201).json({ 
            message: 'Sequence Test added successfully', 
            test: data[0] 
        });
    } catch (error) {
        console.error('Error adding sequence test:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
}

// Get all sequence tests for a specific user
export async function getSequenceTestsByUser(req, res) {
    const { userId } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('sequence_test_results')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        res.status(200).json({ tests: data });
    } catch (error) {
        console.error('Error fetching sequence tests:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
}
