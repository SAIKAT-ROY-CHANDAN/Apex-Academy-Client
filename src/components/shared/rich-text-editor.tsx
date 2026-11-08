"use client";

import type Quill from "quill";
import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// The toolbar mirrors the design mockup: text styling, script, headers,
// sizes, alignment, lists, indent, colors, link and cleanup.
const TOOLBAR_CONFIG = [
  [{ header: [1, 2, 3, false] }],
  [{ size: ["small", false, "large", "huge"] }],
  ["bold", "italic", "underline", "strike"],
  [{ script: "sub" }, { script: "super" }],
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["link", "image"],
  [{ color: [] }, { background: [] }],
  ["clean"],
];

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Write here...",
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  // Read through refs inside the mount-only effect so the hook does not
  // depend on prop identity — the editor is initialized exactly once.
  const placeholderRef = useRef(placeholder);
  const [isReady, setIsReady] = useState(false);

  onChangeRef.current = onChange;
  placeholderRef.current = placeholder;

  useEffect(() => {
    let cancelled = false;

    // Quill touches `document` at module scope — construct it only after
    // mount so SSR never sees it. CSS is loaded dynamically on the client
    // to avoid Next.js 16/Webpack failing to resolve `quill/dist/quill.snow.css`
    // at build time (ESM `type: module` package).
    const setup = async () => {
      await import("quill/dist/quill.snow.css");
      const { default: QuillCtor } = await import("quill");
      if (cancelled || !editorRef.current) return;

      const quillInstance = new QuillCtor(editorRef.current, {
        theme: "snow",
        placeholder: placeholderRef.current,
        modules: { toolbar: TOOLBAR_CONFIG },
      });

      quillInstance.on("text-change", () => {
        const html = quillInstance.root.innerHTML;
        // Quill renders an empty editor as <p><br></p> — normalise to "".
        onChangeRef.current(quillInstance.getText().trim() ? html : "");
      });

      quillRef.current = quillInstance;
      setIsReady(true);
    };

    setup();

    return () => {
      cancelled = true;
      quillRef.current = null;
      setIsReady(false);
    };
  }, []);

  // Push external value changes (initial load, reset) into the editor.
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || !isReady) return;

    if (value !== quill.root.innerHTML) {
      quill.clipboard.dangerouslyPasteHTML(value || "");
    }
  }, [value, isReady]);

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary/30">
        <div ref={editorRef} className="min-h-40" />
      </div>
    </div>
  );
}
