import { animate, AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BarChart3,
  ChevronLeft, // Keep for shell dialog
  CloudFog,
  Compass,
  Crown,
  Gem,
  RefreshCw, // Icon for Try Again
  Sparkles,
  Star,
  Waves,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import islandImage from "../../assets/reading-test/coralBackground.png";
import shellOfFluencyImage from "../../assets/reading-test/shellOfFluencyImage.png";

// Helper function to get score color
const getScoreColor = (score) => {
  if (score === null || score === undefined || isNaN(score))
    return "text-slate-600";
  if (score >= 80) return "text-emerald-500";
  if (score >= 50) return "text-sky-500";
  return "text-rose-500";
};

// Helper component for a simple progress bar
const ScoreProgressBar = ({ score }) => {
  const normalizedScore = Math.max(0, Math.min(100, score || 0));
  let bgColor = "bg-rose-400";
  if (normalizedScore >= 80) bgColor = "bg-emerald-400";
  else if (normalizedScore >= 50) bgColor = "bg-sky-400";

  return (
    <div className="w-full bg-slate-300/70 rounded-full h-2.5 overflow-hidden my-1">
      <motion.div
        className={`h-2.5 rounded-full ${bgColor}`}
        initial={{ width: 0 }}
        animate={{ width: `${normalizedScore}%` }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
    </div>
  );
};

const TestResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const rawScore = Number(location.state?.score) || 0;
  const tableData = location.state?.tableData || [];
  const [animatedScore, setAnimatedScore] = useState(0);

  const initialViewModeBasedOnScore =
    rawScore >= 80 ? "shellDialog" : "resultsTable";
  const [viewMode, setViewMode] = useState(initialViewModeBasedOnScore);

  useEffect(() => {
    if (viewMode === "resultsTable") {
      const controls = animate(0, rawScore, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (latest) => {
          setAnimatedScore(parseFloat(latest.toFixed(2)));
        },
      });
      return () => controls.stop();
    } else if (rawScore > 0 && initialViewModeBasedOnScore === "resultsTable") {
      setAnimatedScore(rawScore);
    }
  }, [rawScore, viewMode, initialViewModeBasedOnScore]);

  const contentCardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -20,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const wordTagVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 250, damping: 12, delay: 0.1 },
    },
  };

  const scoreTextVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [1, 1.05, 1],
      opacity: 1,
      transition: { duration: 0.6, delay: 0.2 },
    },
  };

  const shellImageVariants = {
    hidden: { opacity: 0, y: 50, rotate: -10 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.2 },
    },
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 overflow-y-auto bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${islandImage})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/40 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {viewMode === "shellDialog" && (
              <motion.div
                key="shellDialogView"
                className="w-full max-w-md mx-4"
                variants={contentCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="bg-gradient-to-br from-sky-300/90 via-cyan-400/90 to-emerald-400/90 rounded-3xl shadow-2xl shadow-cyan-500/40 p-6 sm:p-8 relative overflow-hidden">
                  {/* Shell Dialog Content */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full filter blur-xl"></div>
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-400/20 rounded-full filter blur-xl"></div>

                  <motion.h1
                    className="text-3xl sm:text-4xl font-bold text-white mb-3 text-center"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
                    variants={itemVariants}
                  >
                    The Shell of Fluency!
                  </motion.h1>

                  <motion.p
                    className="text-white/90 text-md sm:text-lg mb-6 text-center"
                    variants={itemVariants}
                  >
                    You've successfully navigated the currents!
                  </motion.p>

                  <motion.div
                    className="relative z-10"
                    variants={shellImageVariants}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <img
                      src={shellOfFluencyImage}
                      alt="Shell of Fluency Award"
                      className="w-48 h-auto sm:w-60 mx-auto my-5 drop-shadow-xl"
                    />
                    {rawScore >= 80 && (
                      <motion.div
                        className="absolute -inset-4 bg-yellow-300/20 rounded-full pointer-events-none"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </motion.div>

                  <motion.div className="flex flex-col gap-4">
                    <motion.button
                      onClick={() => setViewMode("resultsTable")}
                      className="bg-yellow-400 hover:bg-yellow-500 text-slate-800 font-bold py-3 px-6 rounded-full shadow-lg text-lg transition-all duration-200 ease-in-out mx-auto flex items-center justify-center min-w-[200px]"
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0px 5px 20px rgba(250, 204, 21, 0.5)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Award className="w-5 h-5 mr-2" />
                      View Your Score
                    </motion.button>

                    <motion.button
                      onClick={() => navigate("/test6")}
                      className="text-sky-100 hover:text-white text-sm font-medium flex items-center justify-center mx-auto transition-colors"
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Explore Again
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {viewMode === "resultsTable" && (
              <motion.div
                key="resultsTableView"
                className="w-full max-w-6xl mx-4"
                variants={contentCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="bg-gradient-to-br from-slate-100/90 via-sky-100/90 to-emerald-100/90 rounded-2xl shadow-2xl shadow-cyan-500/30 px-4 py-6 sm:px-8 sm:py-10 relative overflow-hidden">
                  {/* Results Table Content */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-sky-300/20 rounded-full filter blur-xl"></div>
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-300/20 rounded-full filter blur-xl"></div>

                  <div className="flex flex-col space-y-6">
                    <motion.div
                      className="flex flex-col sm:flex-row items-center justify-between gap-4"
                      variants={itemVariants}
                    >
                      {initialViewModeBasedOnScore === "shellDialog" && (
                        <motion.button
                          onClick={() => setViewMode("shellDialog")}
                          className="flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors duration-200 bg-white/80 hover:bg-sky-50 px-3 py-2 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Crown className="w-4 h-4 mr-1.5 text-sky-600" />
                          Back to Shell
                        </motion.button>
                      )}

                      <motion.div
                        className="flex flex-col items-end p-3 bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-500 rounded-lg shadow-xl"
                        variants={scoreTextVariants}
                      >
                        <span className="text-sm text-white/90 font-semibold flex items-center">
                          <Crown className="w-4 h-4 mr-1.5 text-yellow-300" />
                          Kingdom's Prosperity
                        </span>
                        <span
                          className="text-3xl sm:text-4xl font-bold text-white"
                          style={{ textShadow: "0 1px 4px rgba(0,50,100,0.4)" }}
                        >
                          {animatedScore.toFixed(2)}%
                        </span>
                      </motion.div>
                    </motion.div>

                    <motion.div className="w-full" variants={itemVariants}>
                      <motion.div
                        className="text-2xl sm:text-3xl font-bold text-cyan-700 mb-6 text-center flex flex-col sm:flex-row items-center justify-center gap-2"
                        variants={itemVariants}
                      >
                        <Waves className="w-7 h-7 text-sky-500" />
                        Coral Chronicles Logbook
                        <Sparkles className="w-7 h-7 text-yellow-400" />
                      </motion.div>

                      {tableData.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border-2 border-sky-300/70 shadow-lg bg-white/80">
                          <table className="w-full border-collapse text-sm">
                            <thead className="bg-sky-100/80">
                              <motion.tr variants={itemVariants}>
                                <th className="py-3 px-4 text-left font-semibold text-sky-800 border-b-2 border-sky-300 min-w-[120px]">
                                  <div className="flex items-center">
                                    <Compass className="mr-3 h-5 w-5 text-sky-600" />
                                    <span className="whitespace-nowrap">
                                      Log Entry
                                    </span>
                                  </div>
                                </th>
                                <th className="py-3 px-4 text-left font-semibold text-sky-800 border-b-2 border-sky-200 border-l min-w-[180px]">
                                  <div className="flex items-center">
                                    <Gem className="mr-3 h-5 w-5 text-emerald-500" />
                                    <span className="whitespace-nowrap">
                                      Treasures Collected
                                    </span>
                                  </div>
                                </th>
                                <th className="py-3 px-4 text-left font-semibold text-sky-800 border-b-2 border-sky-300 border-l  min-w-[180px]">
                                  <div className="flex items-center">
                                    <CloudFog className="mr-3 h-5 w-5 text-rose-500" />
                                    <span className="whitespace-nowrap">
                                      Lost in Currents
                                    </span>
                                  </div>
                                </th>
                                <th className="py-3 px-4 text-left font-semibold text-sky-800 border-b-2 border-sky-300 border-l min-w-[120px]">
                                  <div className="flex items-center">
                                    <BarChart3 className="mr-3 h-5 w-5 text-sky-500" />
                                    <span className="whitespace-nowrap">
                                      Tidal Strength
                                    </span>
                                  </div>
                                </th>
                              </motion.tr>
                            </thead>
                            <motion.tbody
                              variants={{
                                visible: {
                                  transition: { staggerChildren: 0.05 },
                                },
                              }}
                            >
                              {tableData.map((segment, index) => (
                                <motion.tr
                                  key={`log-${index}`}
                                  className={`${
                                    index % 2 === 0
                                      ? "bg-white/80"
                                      : "bg-sky-50/70"
                                  } hover:bg-emerald-50/60 transition-colors duration-150`}
                                  variants={tableRowVariants}
                                  whileHover={{ scale: 1.005 }}
                                >
                                  <td className="py-3 px-4 font-medium text-slate-700 border-b border-sky-200">
                                    Log {index + 1}
                                  </td>
                                  <td className="py-3 px-4 text-slate-800 border-b border-l border-sky-200 align-top">
                                    <div className="flex flex-wrap gap-1">
                                      {segment.continuousCorrectWords &&
                                      segment.continuousCorrectWords.trim() !==
                                        "" ? (
                                        segment.continuousCorrectWords
                                          .split(" ")
                                          .map((word, i) => (
                                            <motion.span
                                              key={`treasure-${index}-${i}`}
                                              variants={wordTagVariants}
                                              className="inline-block px-1.5 py-0.5 bg-emerald-100/80 text-emerald-700 rounded-md text-xs shadow-sm border border-emerald-200"
                                            >
                                              {word}
                                            </motion.span>
                                          ))
                                      ) : (
                                        <span className="text-slate-500 italic text-xs">
                                          None
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-slate-800 border-b border-l border-sky-200 align-top">
                                    <div className="flex flex-wrap gap-1">
                                      {segment.errorWords &&
                                      segment.errorWords.trim() !== "" ? (
                                        segment.errorWords
                                          .split(" ")
                                          .map((word, i) => (
                                            <motion.span
                                              key={`lost-${index}-${i}`}
                                              variants={wordTagVariants}
                                              className="inline-block px-1.5 py-0.5 bg-rose-100/80 text-rose-700 rounded-md text-xs shadow-sm border border-rose-200"
                                            >
                                              {word}
                                            </motion.span>
                                          ))
                                      ) : (
                                        <span className="text-slate-500 italic text-xs">
                                          None
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 border-b border-l border-sky-200 align-top">
                                    {segment.score !== null &&
                                    segment.score !== undefined ? (
                                      <div className="flex flex-col items-start">
                                        <span
                                          className={`font-bold text-sm ${getScoreColor(
                                            segment.score
                                          )} mb-0.5`}
                                        >
                                          {segment.score.toFixed(2)}%
                                        </span>
                                        <ScoreProgressBar
                                          score={segment.score}
                                        />
                                        <div className="flex mt-1">
                                          {Array.from({
                                            length: Math.floor(
                                              (segment.score || 0) / 20
                                            ),
                                          })
                                            .slice(0, 5)
                                            .map((_, i) => (
                                              <motion.div
                                                variants={wordTagVariants}
                                                key={`star-${index}-${i}`}
                                              >
                                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-300 mr-0.5" />
                                              </motion.div>
                                            ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-slate-500 italic text-xs">
                                        -
                                      </span>
                                    )}
                                  </td>
                                </motion.tr>
                              ))}
                            </motion.tbody>
                          </table>
                        </div>
                      ) : (
                        <motion.div
                          className="text-center text-slate-500 py-8 bg-white/70 rounded-xl"
                          variants={itemVariants}
                        >
                          The ocean depths are yet to be chronicled.
                        </motion.div>
                      )}

                      {tableData.length > 0 && (
                        <motion.div
                          className="mt-8 pt-5 border-t-2 border-sky-300/80 flex flex-col items-center text-center"
                          variants={itemVariants}
                        >
                          <h3 className="text-lg font-semibold text-cyan-700 mb-2 flex items-center">
                            <Crown className="w-6 h-6 mr-2 text-yellow-400" />
                            Final Kingdom Prosperity
                          </h3>
                          <span
                            className={`text-3xl font-bold ${getScoreColor(
                              rawScore
                            )}`}
                          >
                            {rawScore.toFixed(2)}%
                          </span>
                        </motion.div>
                      )}

                      {initialViewModeBasedOnScore === "resultsTable" && (
                        <motion.div
                          className="mt-8 pt-6 border-t-2 border-sky-300/80 flex flex-col items-center text-center"
                          variants={itemVariants}
                        >
                          <p className="text-slate-600 mb-4 text-md">
                            The currents were a bit strong this time! Don't
                            worry, every explorer faces challenges.
                          </p>
                          <motion.button
                            onClick={() => navigate("/test6")}
                            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-50 flex items-center justify-center mx-auto"
                            whileHover={{
                              boxShadow: "0px 5px 15px rgba(14, 165, 233, 0.4)",
                            }}
                          >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Try Again
                          </motion.button>
                          <motion.button
                            onClick={() => navigate("/")}
                            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-50 flex items-center justify-center mx-auto mt-4"
                            whileHover={{
                              boxShadow: "0px 5px 15px rgba(14, 165, 233, 0.4)",
                            }}
                          >
                            <Compass className="w-5 h-5 mr-2" />
                            Go Home
                          </motion.button>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default TestResults;

// import { ChevronLeft } from "lucide-react";
// import { useLocation, useNavigate } from "react-router-dom";

// const TestResults = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const score = Number(location.state?.score) || 0;
//   const tableData = location.state?.tableData || [];

//   return (
//     <div className="h-screen overflow-y-auto bg-[#f5f5f7]">
//       <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
//         <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm px-6 py-8 sm:px-8 sm:py-10">
//           <div className="flex flex-col space-y-8">
//             <div className="flex items-center justify-between">
//               <button
//                 onClick={() => navigate("/test6")}
//                 className="flex items-center text-sm font-medium text-[#555] hover:text-[#000] transition-colors duration-200"
//               >
//                 <ChevronLeft className="w-4 h-4 mr-1" />
//                 Back to Test
//               </button>

//               <div className="flex flex-col items-end">
//                 <span className="text-sm text-gray-700   font-medium">
//                   Your Score
//                 </span>
//                 <span className="text-3xl font-semibold text-[#111]">
//                   {score.toFixed(2)}%
//                 </span>
//               </div>
//             </div>

//             <div className="w-full overflow-hidden">
//               <div className="text-xl font-medium text-[#111] mb-4">
//                 Result Details
//               </div>

//               <div className="border border-[#e6e6e6] rounded-xl overflow-hidden">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="bg-[#f5f5f7] border-b border-[#e6e6e6]">
//                       <th className="py-4 px-6 text-left text-sm font-medium text-[#555] border-r border-[#e6e6e6]">
//                         Continuous Correct Words
//                       </th>
//                       <th className="py-4 px-6 text-left text-sm font-medium text-[#555] border-r border-[#e6e6e6]">
//                         Error Words
//                       </th>
//                       <th className="py-4 px-6 text-left text-sm font-medium text-[#555]">
//                         Score
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {tableData.length > 0 ? (
//                       tableData.map((row, index) => (
//                         <tr
//                           key={index}
//                           className={
//                             index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
//                           }
//                         >
//                           <td className="py-4 px-6 text-sm text-[#333] border-t border-r border-[#e6e6e6]">
//                             {row.continuousCorrectWords
//                               ? row.continuousCorrectWords.split(" ").join(", ")
//                               : "-"}
//                           </td>
//                           <td className="py-4 px-6 text-sm text-[#333] border-t border-r border-[#e6e6e6]">
//                             {row.errorWords
//                               ? row.errorWords.split(" ").join(", ")
//                               : "-"}
//                           </td>
//                           <td className="py-4 px-6 text-sm text-[#333] border-t border-[#e6e6e6]">
//                             {row.score || "-"}
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan={3}
//                           className="py-4 px-6 text-center text-sm text-[#999] border-t"
//                         >
//                           No data available
//                         </td>
//                       </tr>
//                     )}

//                     {/* Row to display overall score */}
//                     <tr className="bg-[#f5f5f7] font-semibold border-t border-[#e6e6e6]">
//                       <td
//                         colSpan={2}
//                         className="py-4 px-6 text-left text-sm text-[#111] border-r border-[#e6e6e6]"
//                       >
//                         Total Score
//                       </td>
//                       <td className="py-4 px-6 text-sm text-[#111]">
//                         {score.toFixed(2)}%
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

// };

// export default TestResults;
