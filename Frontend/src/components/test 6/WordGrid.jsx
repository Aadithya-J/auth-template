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

const hindiWords = {
  column1: [
    "पेड़", // tree
    "स्कूल", // school
    "फूल", // flower
    "चित्र", // picture
    "सपना", // dream
    "भीड़", // crowd
    "तश्तरी", // saucer
    "कनारी", // canary
    "धुआँ", // smoulder
    "विश्वविद्यालय", // university
    "भौतिकी", // physics
    "जब्ती", // forfeit
    "कर्नल", // colonel
    "असली", // genuine
    "निमोनिया", // pneumonia
    "भूल", // oblivion
    "स्थलीय", // terrestrial
    "विविध", // miscellaneous
    "अविनाशी", // ineradicable
    "रद्द करना", // rescind
  ],
  column2: [
    "छोटा", // little
    "बैठो", // sit
    "सड़क", // road
    "सोचना", // think
    "नीचे", // downstairs
    "सैंडविच", // sandwich
    "देवदूत", // angel
    "आकर्षक", // attractive
    "सराहना", // applaud
    "वाद्यवृंद", // orchestra
    "अभियान", // campaign
    "घेरा", // siege
    "एकल गायक", // soloist
    "संस्था", // institution
    "प्रारंभिक", // preliminary
    "चमकना", // scintillate
    "युद्धकारी", // belligerent
    "टालमटोल करना", // procrastinate
    "न्यायपालिका", // judicature
    "रूपांतरण", // metamorphosis
  ],
  column3: [
    "दूध", // milk
    "मेंढक", // frog
    "घड़ी", // clock
    "गर्मी", // summer
    "बिस्किट", // biscuit
    "शुरुआत", // beginning
    "नौकायन", // sailing
    "कल्पना करना", // imagine
    "निपटान", // disposal
    "ज्ञान", // knowledge
    "गायक मंडली", // choir
    "फुटपाथ", // pavement
    "संगठित", // systematic
    "धुरी", // pivot
    "प्राचीन", // antique
    "व्यंग्यात्मक", // satirical
    "दृढ़", // adamant
    "सत्तावादी", // tyrannical
    "वरीयता आधारित", // preferential
    "निद्राचलन", // somnambulist
  ],
  column4: [
    "अंडा", // egg
    "खेलना", // playing
    "ट्रेन", // train
    "लोग", // people
    "चरवाहा", // shepherd
    "डाक टिकट", // postage
    "प्रकट हुआ", // appeared
    "भतीजा", // nephew
    "पोषित", // nourished
    "दर्शक", // audience
    "बीच-बचाव करना", // intercede
    "विश्वसनीय", // plausible
    "गंदा", // slovenly
    "अंतरात्मा", // conscience
    "संवेदनशील", // susceptible
    "तलवार", // sabre
    "कब्र", // sepulchre
    "सुसमाचार का", // evangelical
    "समनाम", // homonym
    "पुस्तक सूची", // bibliography
  ],
  column5: [
    "किताब", // book
    "बन", // bun
    "प्रकाश", // light
    "कुछ", // something
    "प्यासा", // thirsty
    "द्वीप", // island
    "चाकू", // knife
    "धीरे-धीरे", // gradually
    "रोगग्रस्त", // diseased
    "स्थित", // situated
    "मोहित करना", // fascinate
    "भविष्यवाणी", // prophecy
    "वर्गीकरण", // classification
    "वीर", // heroic
    "पहेली", // enigma
    "बहलाना", // beguile
    "सांख्यिकी", // statistics
    "विचित्र", // grotesque
    "काल्पनिक", // fictitious
    "विशिष्टता", // idiosyncrasy
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

const WordGridHindi = () => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {Object.keys(hindiWords).map((column, index) => (
        <div key={index} style={{ margin: "0 20px" }}>
          {hindiWords[column].map((word, idx) => (
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

export { WordGrid, WordGridTamil, WordGridHindi };
