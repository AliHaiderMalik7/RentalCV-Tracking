import React from "react";

type InputFieldProps = {
  type?: React.HTMLInputTypeAttribute;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  className?: string;
  inputClassName?: string;
  leftIconClassName?: string;
  rightIconClassName?: string;
};

const InputField = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  leftIcon,
  rightIcon,
  onRightIconClick,
  className = "",
  inputClassName = "",
  leftIconClassName = "",
  rightIconClassName = "",
}: InputFieldProps) => {
  return (
    <div className={`relative ${className}`}>
      {leftIcon && (
        <div
          className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 ${leftIconClassName}`}
        >
          {leftIcon}
        </div>
      )}

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full py-3 border-1 border-black rounded-lg focus:outline-none bg-transparent transition-colors duration-300 placeholder-slate-400 ${
          leftIcon ? "pl-12" : "pl-4"
        } ${rightIcon ? "pr-12" : "pr-4"} ${inputClassName}`}
        required={required}
      />

      {rightIcon && (
        <button
          type="button"
          className={`absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 transition-colors duration-300 ${rightIconClassName}`}
          onClick={onRightIconClick}
        >
          {rightIcon}
        </button>
      )}
    </div>
  );
};

export default InputField;
