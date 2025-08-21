import React from "react";
import { FaChevronDown } from "react-icons/fa";

type DropdownProps = {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  selectClassName?: string;
  iconClassName?: string;
};

const Dropdown = ({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  selectClassName = "",
  iconClassName = "text-slate-500",
}: DropdownProps) => {
  return (
    <div className={`relative ${className}`}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full pl-4 pr-10 py-3 border-1 border-black rounded-lg focus:outline-none bg-transparent appearance-none transition-colors duration-300 ${selectClassName}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${iconClassName}`}>
        <FaChevronDown className="h-5 w-5" />
      </div>
    </div>
  );
};

export default Dropdown;