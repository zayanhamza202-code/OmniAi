 "use client";

interface DropZoneProps {
  dragging: boolean;
}

export default function DropZone({
  dragging,
}: DropZoneProps) {
  if (!dragging) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

      <div className="rounded-2xl border-2 border-dashed border-blue-500 bg-zinc-900 px-16 py-20 shadow-2xl">

        <div className="flex flex-col items-center">

          <div className="text-7xl">
            📂
          </div>

          <h2 className="mt-6 text-3xl font-bold">
            Drop files here
          </h2>

          <p className="mt-3 text-zinc-400">
            Upload TXT, PDF, DOCX, CSV and more
          </p>

        </div>

      </div>

    </div>
  );
}