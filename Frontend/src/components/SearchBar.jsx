import React from "react";
import { Search } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function SearchBar({ findNum }) {
  // state for search bar being used or not 
  const [isSearchActive, setIsSearchActive] = useState(false);
  // state for test number entered by the user to search
  const [searchValue, setSearchValue] = useState("");
  const { t } = useLanguage();

  const handleClick = () => {
    setIsSearchActive(true);
  };

  // pass the search_value to the parent component (DropDownsrc/components/TestResultsPage.jsx) 
  const handleSearch = (e) => {
    e.preventDefault();
    findNum(searchValue);
  };

  if (isSearchActive) {
    return (
      <div className="flex flex-row">
        <form onSubmit={handleSearch} className="px-1.5 py-4">
          <div className="flex items-center">
            <input
              type="text"
              placeholder={t("enterTestNumber")}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              required
              className="flex-grow mr-2 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              <Search size={16} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <a
      href="#"
      className="block px-4 py-2 font-semibold text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      onClick={handleClick}
    >
      {t("testNumber")}
    </a>
  );
}
