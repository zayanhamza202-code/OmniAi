"use client";

interface Props {
  files: string[];
  onRemove: (index: number) => void;
}

export default function AttachedFiles({
  files,
  onRemove,
}: Props) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        >
          <span className="text-sm">
            📄 {file}
          </span>

          <button
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}