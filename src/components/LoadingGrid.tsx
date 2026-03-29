export default function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-gray-800 bg-gray-900"
        >
          <div className="aspect-[3/4] bg-gray-800" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 rounded bg-gray-800" />
            <div className="h-3 w-1/2 rounded bg-gray-800" />
            <div className="flex gap-1">
              <div className="h-5 w-12 rounded-full bg-gray-800" />
              <div className="h-5 w-12 rounded-full bg-gray-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
