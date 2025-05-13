import React, { useState } from "react";
import { MdSearch, MdClose } from "react-icons/md";
import { useLanguage } from "../contexts/LanguageContext";

const SearchbyName = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value); // Live search
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full md:w-80 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
    >
      <div className={`relative transition-all duration-300 ease-in-out ${isFocused ? 'translate-y-[-2px]' : ''}`}>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <MdSearch 
            className={`w-5 h-5 transition-all duration-300 ${isFocused ? 'text-blue-600' : 'text-blue-500'}`} 
            aria-hidden="true" 
          />
        </div>
        
        <input
          type="search"
          id="student-search"
          className="w-full py-2 pl-10 pr-16 text-sm text-gray-700 bg-white border border-blue-200 rounded-lg transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md"
          placeholder={t('searchStudent')}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label={t('searchStudent')}
        />
        
        {searchTerm && (
          <button
            type="button"
            className="absolute right-[4.5rem] top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={handleClear}
            aria-label={t('clear')}
          >
            <MdClose className="w-5 h-5" />
          </button>
        )}
        
        <button
          type="submit"
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-100 hover:bg-blue-500 text-blue-700 hover:text-white py-1 px-3 text-sm font-medium rounded-md transition-all duration-300 ease-in-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isFocused ? 'bg-blue-200' : ''}`}
          aria-label={t('submit')}
        >
          {t('search')}
        </button>
      </div>
    </form>
  );
};

export default SearchbyName;
