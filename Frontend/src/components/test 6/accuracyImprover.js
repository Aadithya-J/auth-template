// accuracyImprover.js

export const defaultSpecificCorrections = {

    "three": "tree",

    "tri": "tree",
    "littel": "little", "litle": "little",
    "melk": "milk", "milc": "milk",
    "eg": "egg", "agg": "egg",
    "buk": "book", "bok": "book",
    "scool": "school", "skool": "school", "shool": "school",
    "set": "sit", "sid": "sit",
    "frawg": "frog", "frag": "frog",
    "playin": "playing", "plaing": "playing", "pleying": "playing",
    "ban": "bun", "ben": "bun",
    "flour": "flower", // Homophone, be careful if "flour" is a target word elsewhere
    "flawa": "flower",
    "rode": "road", "rowed": "road", // Homophones
    "clok": "clock", "klock": "clock",
    "trane": "train", "trayn": "train",
    "lite": "light", "lyt": "light",
    "pitcher": "picture", "pikcher": "picture",
    "fink": "think", "tink": "think",
    "sumer": "summer", "sommer": "summer",
    "peeple": "people", "pepol": "people",
    "sumthing": "something", "somethin": "something", "sumthin": "something",
    "dreem": "dream", "dreme": "dream",
    "downstares": "downstairs", "downstair": "downstairs",
    "biskit": "biscuit", "biscut": "biscuit",
    "shepard": "shepherd", "sheperd": "shepherd", "sheppard": "shepherd",
    "firsty": "thirsty", "tursty": "thirsty", "thristy": "thirsty",
    "croud": "crowd", "krowd": "crowd",
    "sandwhich": "sandwich", "sandwitch": "sandwich", "sanwich": "sandwich",
    "begining": "beginning", "beginin": "beginning",
    "postige": "postage", "postedge": "postage",
    "iland": "island", "iseland": "island", "i-land": "island", // 'is land' might be transcribed as two words
    "sosser": "saucer", "sawcer": "saucer",
    "angle": "angel", // Common confusion
    "angell": "angel",
    "sayling": "sailing", "sailin": "sailing",
    "apeared": "appeared", "apeerd": "appeared", "appeard": "appeared",
    "nife": "knife", // silent k
    "kanary": "canary", "canery": "canary",
    "atractive": "attractive", "attractiv": "attractive",
    "imagin": "imagine", "emagine": "imagine",
    "nefew": "nephew", "neffew": "nephew", "neffyou": "nephew",
    "gradualy": "gradually", "graduly": "gradually",
    "smolder": "smoulder", // US spelling, might be transcribed
    "smulder": "smoulder",
    "aplaud": "applaud", "aplaude": "applaud",
    "disposel": "disposal", "dispozel": "disposal",
    "nurished": "nourished", "norished": "nourished",
    "deseased": "diseased", "dizeazed": "diseased",

    // More complex words
    "univercity": "university", "universitee": "university",
    "orkestra": "orchestra", "orhcestra": "orchestra",
    "nolledge": "knowledge", "noledge": "knowledge", "knowlege": "knowledge", // silent k
    "awdience": "audience", "odience": "audience",
    "sitchuated": "situated", "sityated": "situated",
    "fisics": "physics", "physiks": "physics",
    "campain": "campaign", "campane": "campaign",
    "quire": "choir", "kwire": "choir", "cwire": "choir",
    "interseed": "intercede", "intersede": "intercede",
    "fassinate": "fascinate", "fasinate": "fascinate",
    "forfit": "forfeit", "forefit": "forfeit",
    "seege": "siege", "seige": "siege",
    "payvement": "pavement", "pavemant": "pavement",
    "plausable": "plausible", "plawsible": "plausible",
    "profecy": "prophecy", "prophesy": "prophecy", // verb vs noun, ASR might mix
    "kernel": "colonel", "colonell": "colonel", "curnel": "colonel", // phonetic
    "solowist": "soloist", "soloest": "soloist",
    "sistematic": "systematic", "systematik": "systematic",
    "slovenley": "slovenly", "sluvenly": "slovenly",
    "clasification": "classification", "classifacation": "classification",
    "geniune": "genuine", "genuwin": "genuine",
    "institushun": "institution", "institusion": "institution",
    "pivet": "pivot", "pivit": "pivot",
    "conshence": "conscience", "concience": "conscience", "conshus": "conscience", // 'conscious' is different but phonetic
    "heroyk": "heroic", "hiroic": "heroic",
    "numonia": "pneumonia", "newmonia": "pneumonia", // silent p
    "preliminery": "preliminary", "prelimenary": "preliminary",
    "anteek": "antique", "antik": "antique",
    "suseptible": "susceptible", "susceptable": "susceptible",
    "anigma": "enigma", "enygma": "enigma",
    "obliveon": "oblivion", "oblivvion": "oblivion",
    "sintillate": "scintillate", "scintilate": "scintillate",
    "satyrical": "satirical", "saterical": "satirical",
    "saber": "sabre", // US spelling
    "sayber": "sabre",
    "beguyle": "beguile", "bigile": "beguile",
    "terestrial": "terrestrial", "terestreal": "terrestrial",
    "beligerent": "belligerent", "bellijerent": "belligerent",
    "adament": "adamant", "adammant": "adamant",
    "sepulcher": "sepulchre", // US spelling
    "sepulker": "sepulchre",
    "statistiks": "statistics", "statistix": "statistics",
    "miscelaneous": "miscellaneous", "misellanious": "miscellaneous", "miscellanious": "miscellaneous",
    "procastinate": "procrastinate", "procrastinat": "procrastinate",
    "tyranical": "tyrannical", "tyrannicle": "tyrannical",
    "evanjelical": "evangelical", "evangellical": "evangelical",
    "grotesk": "grotesque", "groteck": "grotesque",
    "ineradicible": "ineradicable", "inerradicable": "ineradicable", // common typo
    "judicachur": "judicature", "judikature": "judicature",
    "preferencial": "preferential", "prefferential": "preferential",
    "homonim": "homonym", "homonem": "homonym",
    "ficticious": "fictitious", "fiktitious": "fictitious",
    "resind": "rescind", "recind": "rescind",
    "metamorfosis": "metamorphosis", "metamorphisis": "metamorphosis",
    "somnambulest": "somnambulist", "somnambyoulist": "somnambulist",
    "bibliografy": "bibliography", "bibligraphy": "bibliography",
    "idiosyncracy": "idiosyncrasy", "idiosinkrasy": "idiosyncrasy", "ideosyncrasy": "idiosyncrasy"
};

/**
 * Improves transcription accuracy by applying specific corrections and validating against a target word list.
 * All comparisons and outputs are lowercase.
 * @param {string} rawTranscript The raw transcript string from the ASR.
 * @param {string[]} targetWordsList An array of target words for the current context (e.g., from wordLists.json).
 * @param {Object} [correctionsMap=defaultSpecificCorrections] A map of mis-transcriptions to their correct versions.
 * @returns {string} The corrected transcript, with words joined by spaces, in lowercase.
 */
export const improveTranscriptionAccuracy = (
    rawTranscript,
    targetWordsList,
    correctionsMap = defaultSpecificCorrections
) => {
    if (typeof rawTranscript !== 'string' || rawTranscript.trim() === "") {
        return "";
    }

    if (!Array.isArray(targetWordsList) || !targetWordsList.every(word => typeof word === 'string')) {
        console.error(
            "AccuracyImprover: targetWordsList is not a valid array of strings. Proceeding without target-based corrections.",
            targetWordsList
        );
        return String(rawTranscript)
            .toLowerCase()
            .replace(/[.,!?;:"']/g, "")
            .split(/\s+/)
            .filter(word => word.length > 0)
            .join(" ");
    }

    const lowerCaseTargetWordsSet = new Set(
        targetWordsList.map(word => String(word).toLowerCase())
    );

    const activeCorrections = {};
    for (const incorrectWord in correctionsMap) {
        if (Object.prototype.hasOwnProperty.call(correctionsMap, incorrectWord)) {
            const intendedCorrectWord = String(correctionsMap[incorrectWord]).toLowerCase();
            if (lowerCaseTargetWordsSet.has(intendedCorrectWord)) {
                activeCorrections[String(incorrectWord).toLowerCase()] = intendedCorrectWord;
            } else {
                // console.warn(`AccuracyImprover: Correction for "${incorrectWord}" to "${intendedCorrectWord}" ignored because "${intendedCorrectWord}" is not in current target list.`);
            }
        }
    }

    const cleanedWords = String(rawTranscript)
        .toLowerCase()
        .replace(/[.,!?;:"']/g, "")      // Remove common punctuation
        .split(/\s+/)                   // Split by one or more spaces
        .filter(word => word.length > 0); // Remove any empty strings

    const correctedTranscriptWords = cleanedWords.map(word => {
        if (activeCorrections[word]) {
            return activeCorrections[word];
        }
        if (lowerCaseTargetWordsSet.has(word)) {
            return word;
        }
        // Optional: Future enhancement with Levenshtein distance for fuzzy matching
        // (Requires a library and careful threshold setting)
        return word; // Return the cleaned word if no specific correction applies or it's not in the target list (after attempted correction)
    });

    return correctedTranscriptWords.join(" ");
};