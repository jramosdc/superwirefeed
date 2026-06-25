"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

const BTN =
  "rounded px-2 py-1 text-sm hover:bg-zinc-100 data-[active=true]:bg-zinc-900 data-[active=true]:text-white";

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your story…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({})],
    content: value,
    editorProps: {
      attributes: {
        class: "tiptap prose-body min-h-[200px] px-3 py-2 text-[15px]",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep external resets (e.g. loading an existing post) in sync.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="min-h-[240px] rounded-lg border border-zinc-300 bg-white" />
    );
  }

  return (
    <div className="rounded-lg border border-zinc-300 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 p-1">
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
        <button
          type="button"
          className={BTN}
          data-active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &ldquo; Quote
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
