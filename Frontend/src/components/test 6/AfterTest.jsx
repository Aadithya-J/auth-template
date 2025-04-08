import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const TestResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const score = Number(location.state?.score) || 0;
  const tableData = location.state?.tableData || [];

  return (
    <div className="h-screen overflow-y-auto bg-[#f5f5f7]">
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col space-y-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/test6")}
                className="flex items-center text-sm font-medium text-[#555] hover:text-[#000] transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Test
              </button>
  
              <div className="flex flex-col items-end">
                <span className="text-sm text-[#999] font-medium">
                  Your Score
                </span>
                <span className="text-3xl font-semibold text-[#111]">
                  {score.toFixed(2)}%
                </span>
              </div>
            </div>
  
            <div className="w-full overflow-hidden">
              <div className="text-xl font-medium text-[#111] mb-4">
                Result Details
              </div>
  
              <div className="border border-[#e6e6e6] rounded-xl overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f5f5f7] border-b border-[#e6e6e6]">
                      <th className="py-4 px-6 text-left text-sm font-medium text-[#555] border-r border-[#e6e6e6]">
                        Continuous Correct Words
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-medium text-[#555] border-r border-[#e6e6e6]">
                        Error Words
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-medium text-[#555]">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length > 0 ? (
                      tableData.map((row, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                          }
                        >
                          <td className="py-4 px-6 text-sm text-[#333] border-t border-r border-[#e6e6e6]">
                            {row.continuousCorrectWords
                              ? row.continuousCorrectWords.split(" ").join(", ")
                              : "-"}
                          </td>
                          <td className="py-4 px-6 text-sm text-[#333] border-t border-r border-[#e6e6e6]">
                            {row.errorWords
                              ? row.errorWords.split(" ").join(", ")
                              : "-"}
                          </td>
                          <td className="py-4 px-6 text-sm text-[#333] border-t border-[#e6e6e6]">
                            {row.score || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-4 px-6 text-center text-sm text-[#999] border-t"
                        >
                          No data available
                        </td>
                      </tr>
                    )}
  
                    {/* Row to display overall score */}
                    <tr className="bg-[#f5f5f7] font-semibold border-t border-[#e6e6e6]">
                      <td
                        colSpan={2}
                        className="py-4 px-6 text-left text-sm text-[#111] border-r border-[#e6e6e6]"
                      >
                        Total Score
                      </td>
                      <td className="py-4 px-6 text-sm text-[#111]">
                        {score.toFixed(2)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default TestResults;
