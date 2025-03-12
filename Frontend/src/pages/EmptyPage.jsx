const Home = ({ students, tests }) => {
  const navigate = useNavigate();

  // Handle click for adding a new test
  const handleAddTestClick = () => {
    navigate('/empty'); // Navigate to an empty page or add test page
  };

  const userDetails = {
    name: "RAHUL MAHESH",
    email: "u@gmail.com",
  };

  // Handle click on a specific student
  const handleStudentClick = (studentId) => {
    const storedId = localStorage.getItem('childId');
    if (studentId !== storedId) {
      localStorage.setItem('childId', studentId);
    }
    navigate(`/testreports`); // Navigate to student details page
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      {/* Background image with fixed positioning */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${img1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
        }}
      />

      {/* Scrollable content */}
      <div className="p-6 overflow-auto h-full">
        <h2 className="text-[30px] mb-[0.5] font-bold font-roboto pl-7">
          Welcome,
        </h2>
        <h2
          className="text-[30px] mb-[0.5] font-extrabold font-roboto pl-7"
          style={{ textShadow: '2px 2px 0 #ff937a' }} // Example shadow with color #ff937a
        >
          {userDetails.name}
        </h2>


        <hr className="border-t-2 border-gray-800 mt-4 ml-5 mb-5 mr-5" />

        <div className="flex-grow overflow-auto">
          <div className="flex flex-wrap justify-start">
            <TestCard1 />
            <TestCard2 />
            <TestCard3 />
          </div>
          <hr className="border-t-2 border-gray-800 mt-5 ml-5 mr-5 mb-3" />
          <div className="space-y-2 p-5">
            {students.length > 0 ? (
              students.slice(0, 10).map((student) => (
                <StudentList
                  key={student._id}
                  student={student}
                  buttonLabel="View Results"
                  onButtonClick={() => handleStudentClick(student._id)}
                />
              ))
            ) : (
              <p>No students available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
