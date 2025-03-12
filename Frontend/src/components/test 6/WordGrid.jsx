const words = {
  column1: ["tree", "school", "flower", "picture", "dream", "crowd", "saucer", "canary", "smoulder", "university", "physics", "forfeit", "colonel", "genuine", "pneumonia", "oblivion", "terrestrial", "miscellaneous", "ineradicable", "rescind"],
  column2: ["little", "sit", "road", "think", "downstairs", "sandwich", "angel", "attractive", "applaud", "orchestra", "campaign", "siege", "soloist", "institution", "preliminary", "scintillate", "belligerent", "procrastinate", "judicature", "metamorphosis"],
  column3: ["milk", "frog", "clock", "summer", "biscuit", "beginning", "sailing", "imagine", "disposal", "knowledge", "choir", "pavement", "systematic", "pivot", "antique", "satirical", "adamant", "tyrannical", "preferential", "somnambulist"],
  column4: ["egg", "playing", "train", "people", "shepherd", "postage", "appeared", "nephew", "nourished", "audience", "intercede", "plausible", "slovenly", "conscience", "susceptible", "sabre", "sepulchre", "evangelical", "homonym", "bibliography"],
  column5: ["book", "bun", "light", "something", "thirsty", "island", "knife", "gradually", "diseased", "situated", "fascinate", "prophecy", "classification", "heroic", "enigma", "beguile", "statistics", "grotesque", "fictitious", "idiosyncrasy"]
};

const getFontSize = (idx) => {
    if(idx === 0 ){
        return '26px'
    }
    if(idx === 1 ){
        return '26px'
    }
    if(idx === 2 ){
        return '26px'
    }
    if(idx === 3 ){
        return '26px'
    }
    if(idx === 4 ){
        return '20px'
    }
    if(idx === 5 ){
      return '20px'
    }
    if(idx === 6 ){
      return '20px'
    }
    if(idx === 7 ){
      return '20px'
    }
    if(idx === 8 ){
      return '20px'
    }
    if(idx === 9 ){
      return '20px'
    }
    
    return '17px'
}

const WordGrid = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {Object.keys(words).map((column, index) => (
        <div key={index} style={{ margin: '0 20px' }}>
          {words[column].map((word, idx) => (
            <div key={idx} style={{ margin: '5px 0',  fontSize: getFontSize(idx) }}>
              {word}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default WordGrid;