import React from "react";
import { Clock } from "lucide-react";

interface FloatingNowButtonProps {
  show: boolean;
  label: string;
  onClick: () => void;
}

export default function FloatingNowButton({ show, label, onClick }: FloatingNowButtonProps) {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-rose-500 px-4 py-3 text-white shadow-lg hover:bg-rose-600 transition-all duration-200 hover:scale-105"
      title="Jump to current time"
    >
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
