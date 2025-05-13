import { useLanguage } from '../contexts/LanguageContext';

/**
 * Replace variables in a translation string
 * @param {string} text - The text containing variable placeholders {varName}
 * @param {Object} variables - Object with variable names as keys and their values
 * @returns {string} The text with variables replaced
 */
export const replaceVars = (text, variables) => {
  if (!text) return '';
  
  return Object.entries(variables).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{${key}}`, 'g'), value),
    text
  );
};

/**
 * Hook for easy pluralization in components
 * @returns {Function} Pluralization function to use in components
 */
export const usePluralize = () => {
  const { t } = useLanguage();
  
  /**
   * Get the correctly pluralized text based on count
   * @param {number} count - The count to determine pluralization
   * @param {Object} keys - Object with zero, one, and many keys for translation keys
   * @returns {string} The pluralized text
   */
  return (count, keys) => {
    const { zero, one, many } = keys;
    
    if (count === 0 && zero) return t(zero);
    if (count === 1 && one) return t(one);
    return replaceVars(t(many), { count: count.toString() });
  };
};

/**
 * React hook that provides enhanced translation utilities
 * @returns {Object} Enhanced translation utilities
 */
export const useTranslation = () => {
  const { t, language, setLanguage } = useLanguage();
  const pluralize = usePluralize();
  
  /**
   * Translate with variable replacement
   * @param {string} key - Translation key
   * @param {Object} vars - Variables to replace in the translation
   * @returns {string} Translated text with variables replaced
   */
  const tVar = (key, vars) => {
    return replaceVars(t(key), vars);
  };
  
  /**
   * Format a date according to the current language
   * @param {Date} date - The date to format
   * @param {string} format - Optional format override
   * @returns {string} Formatted date string
   */
  const formatDate = (date, format) => {
    if (!date) return '';
    
    // Use language-specific date format from translations
    const dateFormat = format || t('dateFormat') || 'MM/DD/YYYY';
    
    // Simple formatting, in a real app you might use a library like date-fns
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return dateFormat
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year);
  };
  
  /**
   * Get a relative time string (today, yesterday, X days ago)
   * @param {Date} date - The date to format
   * @returns {string} Relative time string
   */
  const getRelativeTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const d = new Date(date);
    
    // Reset time part for accurate day calculation
    now.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    
    const diffTime = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday');
    
    return tVar('daysAgo', { days: diffDays.toString() });
  };
  
  return {
    t,
    tVar,
    language,
    setLanguage,
    pluralize,
    formatDate,
    getRelativeTime
  };
};

/**
 * Translate test data including test names, descriptions, and instructions
 * Useful when you need to translate content coming from the API
 * 
 * @param {Object} test - The test object from API
 * @returns {Object} Translated test object
 */
export const translateTestData = (test) => {
  const { t } = useLanguage();
  
  if (!test) return null;
  
  // Check if there are translation keys for this test
  const testNameKey = `test.${test.id}.name`;
  const testAboutKey = `test.${test.id}.about`;
  
  return {
    ...test,
    // If there's a translation key for this test name, use it, otherwise keep original
    testName: t(testNameKey) !== testNameKey ? t(testNameKey) : test.testName,
    About: t(testAboutKey) !== testAboutKey ? t(testAboutKey) : test.About
  };
}; 