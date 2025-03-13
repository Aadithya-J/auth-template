
// exports.addTest = async (req, res) => {
//     const { childId, test_name, reading_age, score, correctWords, incorrectWords } = req.body; // Add correctWords and incorrectWords to the body

//     try {
//         const test = new Test({
//             child_id: childId,
//             test_name,
//             reading_age,
//             score,
//             correct_words: correctWords,  // Assuming you want to store these as well
//             incorrect_words: incorrectWords,  // Assuming you want to store these as well
//         });
//         await test.save();

//         // Increment the number of tests taken by the child
//         await Child.findByIdAndUpdate(childId, {
//             $inc: { tests_taken: 1 }
//         });

//         res.status(201).json({ message: 'Test added successfully', test });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error });
//     }
// };

export async function addTest6(req, res) {
    const { childId, spokenWords } = req.body;

    try {
        // Fetch the latest correct stored text from Supabase
        const { data: testData, error: fetchError } = await supabase
            .from('Tests') // Assuming 'Tests' stores correct texts
            .select('stored_text')
            .eq('child_id', childId)
            .order('created_at', { ascending: false }) // Get latest entry
            .limit(1)
            .single();

        if (fetchError || !testData) {
            return res.status(400).json({ message: 'Test data not found', error: fetchError });
        }

        const storedText = testData.stored_text.split(' ').map((word, index) => ({ word: word.toLowerCase(), position: index + 1 }));
        const spokenArray = spokenWords.split(' ').map((word, index) => ({ word: word.toLowerCase(), position: index + 1 }));

        // Compare spoken words with stored text
        const correctWords = spokenArray.filter(({ word }) => storedText.some(({ word: storedWord }) => storedWord === word));
        const incorrectWords = spokenArray.filter(({ word }) => !storedText.some(({ word: storedWord }) => storedWord === word));

        const score = ((storedText.length - incorrectWords.length) / storedText.length) * 100;

        // Save test result in Supabase (Results table)
        const { error: insertError } = await supabase
            .from('Results') // Assuming 'Results' stores test results
            .insert([{ 
                child_id: childId, 
                spoken_words: spokenWords, 
                correct_words: JSON.stringify(correctWords), // Store as JSON
                incorrect_words: JSON.stringify(incorrectWords), // Store as JSON
                score 
            }]);

        if (insertError) throw insertError;

        res.status(201).json({ 
            message: 'Test6 added successfully', 
            score, 
            correctWords, 
            incorrectWords 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}





// Get all tests for a specific child
export async function getTestsByChild(req, res) {
    const { childId } = req.params;

    try {
        const tests = await Test.find({ child_id: childId });
        res.status(200).json({ tests });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}
