import { useMemo, useEffect } from "react";
import styles from "../../styles/Test.module.css";
import { useNavigate } from "react-router-dom";

// Ensure wordsGrid is imported or defined in this file
const wordsGrid = [
  ["tree", "little", "milk", "egg", "book"],            // Row 1
  ["school", "sit", "frog", "playing", "bun"],          // Row 2
  ["flower", "road", "clock", "train", "light"],        // Row 3
  ["picture", "think", "summer", "people", "something"],// Row 4
  ["dream", "downstairs", "biscuit", "shepherd", "thirsty"], // Row 5
  ["crowd", "sandwich", "beginning", "postage", "island"],   // Row 6
  ["saucer", "angel", "sailing", "appeared", "knife"],       // Row 7
  ["canary", "attractive", "imagine", "nephew", "gradually"],// Row 8
  ["smoulder", "applaud", "disposal", "nourished", "diseased"], // Row 9
  ["university", "orchestra", "knowledge", "audience", "situated"], // Row 10
  ["physics", "campaign", "choir", "intercede", "fascinate"], // Row 11
  ["forfeit", "siege", "pavement", "plausible", "prophecy"],  // Row 12
  ["colonel", "soloist", "systematic", "slovenly", "classification"], // Row 13
  ["genuine", "institution", "pivot", "conscience", "heroic"], // Row 14
  ["pneumonia", "preliminary", "antique", "susceptible", "enigma"],   // Row 15
  ["oblivion", "scintillate", "satirical", "sabre", "beguile"],  // Row 16
  ["terrestrial", "belligerent", "adamant", "sepulchre", "statistics"], // Row 17
  ["miscellaneous", "procrastinate", "tyrannical", "evangelical", "grotesque"], // Row 18
  ["ineradicable", "judicature", "preferential", "homonym", "fictitious"], // Row 19
  ["rescind", "metamorphosis", "somnambulist", "bibliography", "idiosyncrasy"]  // Row 20
];

const AfterTest = ({ username, score, age, correctWords, incorrectWords }) => {
  console.log('Received props:', { username, score, age, correctWords, incorrectWords });
  const navigate = useNavigate();

  // Format words with numbers
  const formatWordsWithNumbers = (words) => 
      words.map(({ word, position }) => `${word} (${position})`).join(", ");

  return (
      <div className={styles.resultsContainer}>
          <div className={styles.results}>
              <h1>Name: <span>{username}</span></h1>
              <h1>Score: <span>{score.toFixed(2)}%</span></h1>
              <h1>Reading Age: <span>{age}</span></h1>
              <table>
                  <thead>
                      <tr>
                          <th>Correct Words</th>
                          <th>Incorrect Words</th>
                          <th>Score</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>{formatWordsWithNumbers(correctWords)}</td>
                          <td>{formatWordsWithNumbers(incorrectWords)}</td>
                          <td>{score.toFixed(2)}%</td>
                      </tr>
                  </tbody>
              </table>
              <button onClick={() => navigate("/home")}>Go back</button>
          </div>
      </div>
  );
};


export default AfterTest;
