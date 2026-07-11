"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { useWorkspaceStore } from "@/store/workspaceStore";

import "highlight.js/styles/github-dark.css";

interface Props {
  content: string;
}

const extractText = (node: any): string => {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && node.props && node.props.children) {
    return extractText(node.props.children);
  }
  return "";
};

export default function MarkdownMessage({ content }: Props) {
  const { openWorkspace } = useWorkspaceStore();

  const CustomCodeComponent = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "text";

    if (!inline && match) {
      return (
        <div className="relative group rounded-md overflow-hidden bg-zinc-900 border border-zinc-800 my-4">
          <div className="flex items-center justify-between px-4 py-1.5 bg-black text-zinc-400 text-xs font-mono border-b border-zinc-800">
            <span>{language}</span>
            <button
              onClick={() => {
                const rawCode = extractText(children).replace(/\n$/, "");
                openWorkspace(rawCode, language);
              }}
              className="px-2 py-1 bg-zinc-800 hover:bg-blue-600 hover:text-white rounded transition text-zinc-300"
            >
              View in Workspace
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-sm">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    }
    return (
      <code className={`${className} bg-zinc-800/50 rounded px-1.5 py-0.5 text-[0.9em]`} {...props}>
        {children}
      </code>
    );
  };

  const CustomImageComponent = ({ src, alt, ...props }: any) => {
    return (
      <div className="my-4 flex justify-center">
        <img
          src={src}
          alt={alt || "Generated Output"}
          className="rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/10 max-h-[400px] w-auto object-contain"
          {...props}
        />
      </div>
    );
  };

  return (
    <div className="prose prose-invert max-w-none break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          code: CustomCodeComponent,
          img: CustomImageComponent,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}