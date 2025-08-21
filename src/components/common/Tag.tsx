import React, { ReactNode } from 'react';

type ColorVariant = 
  | 'gray' 
  | 'blue' 
  | 'red' 
  | 'green' 
  | 'yellow' 
  | 'indigo' 
  | 'purple' 
  | 'pink'
  | 'emerald'
  | 'amber'
  | 'cyan'
  | 'sky'
  | 'violet'
  | 'fuchsia'
  | 'rose';

interface TagProps {
  icon?: ReactNode;
  label: string;
  color?: ColorVariant;
}

export const Tag: React.FC<TagProps> = ({ 
  icon, 
  label, 
  color = 'gray' 
}) => {
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full 
      text-xs font-medium 
      bg-${color}-50 text-${color}-700
    `}>
      {icon && <span className="mr-1.5">{icon}</span>}
      {label}
    </span>
  );
};