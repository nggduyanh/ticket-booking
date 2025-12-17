import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const Autocomplete = ({
  options = [],
  value,
  onChange,
  onSearch,
  placeholder = "Tìm kiếm...",
  displayKey = "name",
  valueKey = "_id",
  className = "",
  debounceMs = 500, // Delay 500ms before search
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const wrapperRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    // Set display text from selected value only when value changes
    if (value && value !== selectedValue && options.length > 0) {
      const selected = options.find((opt) => opt[valueKey] === value);
      if (selected) {
        setSearchTerm(selected[displayKey]);
        setSelectedValue(value);
      }
    } else if (!value && selectedValue) {
      setSearchTerm("");
      setSelectedValue("");
    }
  }, [value, selectedValue, options, valueKey, displayKey]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      if (onSearch) {
        onSearch(newValue);
      }
    }, debounceMs);
  };

  const handleSelect = (option) => {
    // Set display text to selected item
    setSearchTerm(option[displayKey]);
    onChange(option[valueKey]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    onChange("");
    setIsOpen(true);
    if (onSearch) {
      onSearch("");
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (onSearch) {
      onSearch(searchTerm || "");
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-8 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {value && (
            <button
              onClick={handleClear}
              className="w-full px-4 py-2 text-left hover:bg-gray-700 text-gray-400 text-sm border-b border-gray-700"
            >
              Xóa lựa chọn
            </button>
          )}
          {options.length === 0 ? (
            <div className="px-4 py-3 text-gray-400 text-sm">
              Không tìm thấy kết quả
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option[valueKey]}
                onClick={() => handleSelect(option)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition ${
                  option[valueKey] === value
                    ? "bg-gray-700 text-primary"
                    : "text-white"
                }`}
              >
                {option[displayKey]}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
