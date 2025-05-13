const words = {
  column1: [
    "tree",
    "school",
    "flower",
    "picture",
    "dream",
    "crowd",
    "saucer",
    "canary",
    "smoulder",
    "university",
    "physics",
    "forfeit",
    "colonel",
    "genuine",
    "pneumonia",
    "oblivion",
    "terrestrial",
    "miscellaneous",
    "ineradicable",
    "rescind",
  ],
  column2: [
    "little",
    "sit",
    "road",
    "think",
    "downstairs",
    "sandwich",
    "angel",
    "attractive",
    "applaud",
    "orchestra",
    "campaign",
    "siege",
    "soloist",
    "institution",
    "preliminary",
    "scintillate",
    "belligerent",
    "procrastinate",
    "judicature",
    "metamorphosis",
  ],
  column3: [
    "milk",
    "frog",
    "clock",
    "summer",
    "biscuit",
    "beginning",
    "sailing",
    "imagine",
    "disposal",
    "knowledge",
    "choir",
    "pavement",
    "systematic",
    "pivot",
    "antique",
    "satirical",
    "adamant",
    "tyrannical",
    "preferential",
    "somnambulist",
  ],
  column4: [
    "egg",
    "playing",
    "train",
    "people",
    "shepherd",
    "postage",
    "appeared",
    "nephew",
    "nourished",
    "audience",
    "intercede",
    "plausible",
    "slovenly",
    "conscience",
    "susceptible",
    "sabre",
    "sepulchre",
    "evangelical",
    "homonym",
    "bibliography",
  ],
  column5: [
    "book",
    "bun",
    "light",
    "something",
    "thirsty",
    "island",
    "knife",
    "gradually",
    "diseased",
    "situated",
    "fascinate",
    "prophecy",
    "classification",
    "heroic",
    "enigma",
    "beguile",
    "statistics",
    "grotesque",
    "fictitious",
    "idiosyncrasy",
  ],
};

const tamilWords = {
  column1: [
    "மரம்", // tree
    "பள்ளி", // school
    "மலர்", // flower
    "படம்", // picture
    "கனவு", // dream
    "கூட்டம்", // crowd
    "தட்டம்", // plate
    "கிளி", // parrot
    "புகை", // smoke
    "பேச்சு", // speech
    "கேப்டன்", // captain
    "நிகழ்ச்சி", // event
    "அறிவு", // knowledge
    "நினைவு", // memory
    "துவக்கம்", // start
    "அறிகுறி", // signal
    "சிலப்பம்", // hint
    "புகழ்", // fame
  ],
  column2: [
    "சிறியது", // small
    "உட்காரு", // sit
    "சாலை", // road
    "நினை", // think
    "தாழ்த்திடம்", // low place
    "சாண்ட்விச்சு", // sandwich
    "தேவதை", // angel
    "அழகான", // beautiful
    "இசைக்குழு", // music band
    "பிரச்சாரம்", // announcement
    "பிரச்சினை", // problem
    "தனிப்பாடகர்", // soloist
    "நிறுவனம்", // organization
    "முதன்மை", // main
    "விழிப்புணர்வு", // awareness
    "போர்வீரன்", // soldier
    "முடக்கிக் கொள்", // block
    "நீதிநிலை", // justice
  ],
  column3: [
    "பால்", // milk
    "தவளை", // frog
    "கோடை", // summer
    "பிஸ்கட்", // biscuit
    "படகுப்பயணம்", // boating
    "பாடல்", // song
    "அகற்றல்", // removal
    "பதிவு", // record
    "அறிவு", // knowledge
    "வழித்தடம்", // path
    "படைப்பாளர்", // creator
    "பொதி", // package
    "கட்டுப்பாடு", // control
    "முயற்சி", // effort
    "நகைச்சுவை", // humor
    "தற்செயல்", // accident
    "முடிவு", // end
    "விருப்பம்", // preference
  ],
  column4: [
    "மூடு", // close
    "விளையாடு", // play
    "ரயில்", // train
    "மக்கள்", // people
    "மேய்ப்பவன்", // herder
    "அஞ்சல்", // post
    "விழி", // eye
    "தோற்றம்", // appearance
    "நம்பிக்கை", // trust
    "அழிவுபெறு", // collapse
    "வாலிபன்", // youth
    "செயலாக்கம்", // activation
    "நம்பகமுள்ள", // reliable
    "பாதுகாப்பு", // protection
    "பகிர்வு", // sharing
    "போதுமான", // sufficient
    "வெளிச்சம்", // light
    "உலகின்", // world
  ],
};

const getFontSize = (idx) => {
  if (idx === 0) {
    return "26px";
  }
  if (idx === 1) {
    return "26px";
  }
  if (idx === 2) {
    return "26px";
  }
  if (idx === 3) {
    return "26px";
  }
  if (idx === 4) {
    return "20px";
  }
  if (idx === 5) {
    return "20px";
  }
  if (idx === 6) {
    return "20px";
  }
  if (idx === 7) {
    return "20px";
  }
  if (idx === 8) {
    return "20px";
  }
  if (idx === 9) {
    return "20px";
  }

  return "17px";
};

const WordGrid = () => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {Object.keys(words).map((column, index) => (
        <div key={index} style={{ margin: "0 20px" }}>
          {words[column].map((word, idx) => (
            <div
              key={idx}
              style={{ margin: "5px 0", fontSize: getFontSize(idx) }}
            >
              {word}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const WordGridTamil = () => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {Object.keys(tamilWords).map((column, index) => (
        <div key={index} style={{ margin: "0 20px" }}>
          {tamilWords[column].map((word, idx) => (
            <div
              key={idx}
              style={{ margin: "5px 0", fontSize: getFontSize(idx) }}
            >
              {word}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export { WordGrid, WordGridTamil };
