import { ReactNode, MouseEvent } from 'react';

type MediaButtonProps = {
  icon: ReactNode;
  count: number;
  label: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
};

export const MediaButton = ({ icon, count, label, onClick }: MediaButtonProps) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-3 w-20 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
  >
    <span className="text-gray-600 mb-1">{icon}</span>
    <span className="text-xs font-medium text-gray-700">{count}</span>
    <span className="text-xs text-gray-500">{label}</span>
  </button>
);