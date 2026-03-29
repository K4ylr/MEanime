"use client";

export default function WatchedButton({
  isWatched,
  onClick,
}: {
  isWatched: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-1.5 text-center text-xs font-medium transition-colors ${
        isWatched
          ? "bg-pink-500/20 text-pink-400 hover:bg-pink-500/30"
          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
      }`}
    >
      {isWatched ? "已看 ✓" : "+ 已看"}
    </button>
  );
}
