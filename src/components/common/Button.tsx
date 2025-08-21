import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  iconPath?: string; // Now accepts SVG path
  iconPosition?: "left" | "right";
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
};

const Button = ({
  children,
  onClick,
  type = "button",
  iconPath,
  iconPosition = "left",
  className = "",
  iconClassName = "w-5 h-5",
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center ${className}`}
    >
      {iconPath && iconPosition === "left" && (
        <img src={iconPath} className={`mr-2 ${iconClassName}`} alt="icon" />
      )}
      {children}
      {iconPath && iconPosition === "right" && (
        <img src={iconPath} className={`ml-2 ${iconClassName}`} alt="icon" />
      )}
    </button>
  );
};

export default Button;
