"use client";

import { useState, useRef, useEffect, useMemo } from "react";

export interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: (string | Option)[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string; // For native form submissions
  required?: boolean;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  name,
  disabled = false,
  required = false,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedValue, setSelectedValue] = useState(value || "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state with incoming value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Normalize input options array into uniform { label, value, sublabel } objects
  const normalizedOptions: Option[] = useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt
    );
  }, [options]);

  // Filter options based on label OR sublabel matching search query
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return normalizedOptions;

    return normalizedOptions.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(query);
      const matchSublabel = opt.sublabel
        ? opt.sublabel.toLowerCase().includes(query)
        : false;
      return matchLabel || matchSublabel;
    });
  }, [normalizedOptions, search]);

  // Active option object for display
  const selectedOption = normalizedOptions.find(
    (opt) => opt.value === selectedValue
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    if (onChange) onChange(optionValue);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Hidden Input for standard FormData submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          disabled={disabled}
          value={selectedValue}
          required={required}
        />
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between border border-emerald-900/20 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 text-left disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="truncate pr-2">
          {selectedOption ? (
            <>
              <span className="text-emerald-950 font-medium block truncate">
                {selectedOption.label}
              </span>
              {selectedOption.sublabel && (
                <span className="text-xs text-gray-500 block truncate">
                  {selectedOption.sublabel}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <span className="text-gray-400 text-xs ml-2 shrink-0">▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-emerald-900/15 bg-white shadow-lg overflow-hidden">
          {/* Search Input Box */}
          <div className="p-2 border-b border-emerald-900/10 bg-emerald-50/30">
            <input
              type="text"
              value={search}
              disabled={disabled}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or details..."
              autoFocus
              className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>

          {/* Options List */}
          <ul className="max-h-56 overflow-y-auto py-1 text-sm divide-y divide-emerald-900/5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === selectedValue;
                return (
                  <li
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`px-3 py-2 cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? "bg-emerald-100/70 text-emerald-950 font-medium"
                        : "text-gray-700 hover:bg-emerald-50"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="block truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="block text-xs text-gray-500 truncate">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-emerald-800 font-bold text-xs shrink-0 ml-2">
                        ✓
                      </span>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-3 text-xs text-gray-500 text-center">
                No matching options found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}