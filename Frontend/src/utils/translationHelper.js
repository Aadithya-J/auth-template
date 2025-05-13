/**
 * Finds all hardcoded text in a component and creates translation entries
 * 
 * Usage: Run this function in the browser console when viewing a component
 * that has hardcoded text that needs translation. It will print suggested
 * translation entries to add to the translations file.
 * 
 * @returns {void} Prints suggested translation entries to console
 */
export const findHardcodedText = () => {
  // Get all text nodes in the document
  const textNodes = [];
  const walk = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walk.nextNode())) {
    // Skip empty text nodes, whitespace-only nodes, and script/style content
    const text = node.nodeValue.trim();
    if (
      text.length > 0 && 
      !node.parentElement.closest('script') && 
      !node.parentElement.closest('style')
    ) {
      textNodes.push({
        text: text,
        element: node.parentElement
      });
    }
  }

  // Filter out nodes that likely don't need translation
  const potentialHardcodedText = textNodes.filter(
    ({ text }) => 
      // Skip numbers, dates, CSS classes, etc.
      isNaN(text) &&
      text.length > 1 &&
      !/^\d+(\.\d+)?$/.test(text) && // Skip numbers
      !/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(text) && // Skip dates
      !/^\w+[-:]?\w+$/.test(text) && // Skip CSS class-like strings
      !/^[A-Z_]+$/.test(text) && // Skip constants
      !text.startsWith('{{') // Skip template expressions
  );

  // Generate suggested translation entries
  console.log("=== SUGGESTED TRANSLATION ENTRIES ===");
  console.log("Add these to your translations file:");
  
  const suggestedEntries = {};
  
  potentialHardcodedText.forEach(({ text }) => {
    // Create a camelCase key from the text
    const key = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .map((word, index) => 
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
    
    if (key && !suggestedEntries[key]) {
      suggestedEntries[key] = text;
    }
  });
  
  // Output English entries
  console.log("// English entries");
  Object.entries(suggestedEntries).forEach(([key, value]) => {
    console.log(`${key}: "${value}",`);
  });
  
  console.log("\n// Tamil entries - NEED TRANSLATION");
  Object.entries(suggestedEntries).forEach(([key, value]) => {
    console.log(`${key}: "${value}", // TODO: Add Tamil translation`);
  });
  
  console.log("\n=== HOW TO USE ===");
  console.log('1. Replace hardcoded text with t("key")');
  console.log('2. Add missing Tamil translations');
  console.log('3. Import useLanguage and use the t function in your component:');
  console.log('   const { t } = useLanguage();');
  
  return "Translation helper executed. Check console for results.";
};

/**
 * Updates an element's text content to use a translation key
 * 
 * Usage: Call this function with a CSS selector and the translation key
 * 
 * @param {string} selector CSS selector for the element
 * @param {string} translationKey The key to use in t("key")
 * @returns {string} Success message or error
 */
export const convertToTranslation = (selector, translationKey) => {
  try {
    const element = document.querySelector(selector);
    if (!element) {
      return `Element not found: ${selector}`;
    }
    
    // Store original text
    const originalText = element.textContent;
    
    // Replace text with indicator that it uses translation
    element.textContent = `[t("${translationKey}")]`;
    
    return `Converted: "${originalText}" → t("${translationKey}")`;
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

/**
 * Extracts all text content from a component file and suggests translation keys
 * This is for use during development, not in production
 * 
 * @param {string} componentCode The component's source code
 * @returns {Object} Suggested translation entries
 */
export const extractTextFromComponent = (componentCode) => {
  // Extract text from JSX
  const textMatches = componentCode.match(/>([^<>{]+)</g) || [];
  const labelMatches = componentCode.match(/label=["']([^"']+)["']/g) || [];
  const placeholderMatches = componentCode.match(/placeholder=["']([^"']+)["']/g) || [];
  const titleMatches = componentCode.match(/title=["']([^"']+)["']/g) || [];
  const ariaLabelMatches = componentCode.match(/aria-label=["']([^"']+)["']/g) || [];
  
  const allMatches = [
    ...textMatches.map(m => m.replace(/>[^<]+</g, m => m.slice(1, -1).trim())),
    ...labelMatches.map(m => m.match(/label=["']([^"']+)["']/)[1]),
    ...placeholderMatches.map(m => m.match(/placeholder=["']([^"']+)["']/)[1]),
    ...titleMatches.map(m => m.match(/title=["']([^"']+)["']/)[1]),
    ...ariaLabelMatches.map(m => m.match(/aria-label=["']([^"']+)["']/)[1])
  ].filter(text => 
    // Apply same filters as findHardcodedText
    text && 
    text.trim().length > 1 &&
    isNaN(text) &&
    !/^\d+(\.\d+)?$/.test(text) &&
    !/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(text) &&
    !/^\w+[-:]?\w+$/.test(text) &&
    !/^[A-Z_]+$/.test(text) &&
    !text.startsWith('{{')
  );
  
  // Generate suggested translation entries
  const suggestedEntries = {};
  
  allMatches.forEach(text => {
    // Create a camelCase key from the text
    const key = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .map((word, index) => 
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
    
    if (key && !suggestedEntries[key]) {
      suggestedEntries[key] = text;
    }
  });
  
  return suggestedEntries;
}; 