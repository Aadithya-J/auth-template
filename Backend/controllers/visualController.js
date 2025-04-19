import supabase from '../utils/supabaseClient.js';

export async function addVisual(req, res) {
    const { child_id, options } = req.body;
    console.log(options);
    try {
        // Insert new test result
        const { data, error } = await supabase
            .from('visual_test_results')
            .insert([{ child_id, options }])
            .select('*');
        
        if (error) throw error;
        
        const { error: updateError } = await supabase
            .rpc('increment_tests_taken', { child_id_param: child_id });
        
        if (updateError) throw updateError;
        
        res.status(201).json({ message: 'Visual Discrimination Test added successfully', test: data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Get all tests for a specific child
export async function getVisualByChild(req, res) {
    const { childId } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('visual_test_results')
            .select('*')
            .eq('child_id', childId);
        
        if (error) throw error;
        
        res.status(200).json({ tests: data });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
