'use client';

import { useState } from 'react';
import { MultiSelectDropdownProps } from '@/types/reports';

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Select options...',
  isLoading = false,
  emptyMessage = 'No options available',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (value: number) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    } else {
      onSelectionChange([...selectedValues, value]);
    }
  };

  const selectAll = () => {
    onSelectionChange(options.map((opt) => opt.value));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const selectedOption = options.find(
        (opt) => opt.value === selectedValues[0]
      );
      return selectedOption?.label || placeholder;
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 flex justify-between items-center cursor-pointer"
      >
        <span className={selectedValues.length === 0 ? 'text-gray-400' : ''}>
          {getDisplayText()}
        </span>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {selectedValues.length} selected
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-2 text-sm text-gray-500">
                Loading...
              </div>
            ) : options.length === 0 ? (
              <div className="text-center py-2 text-sm text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 py-2 px-3 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2"
                  />
                  <span className="text-sm flex-1">
                    {option.label}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;