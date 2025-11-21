import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Underline } from '@tiptap/extension-underline';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading1, Heading2, Heading3,
  Table as TableIcon, Plus, Trash2, MoreHorizontal
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-700 bg-gray-100 p-2 flex flex-wrap gap-2 sticky top-0 z-10 text-black">
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-1 rounded hover:bg-gray-300 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-1 rounded hover:bg-gray-300 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1 rounded hover:bg-gray-300 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
          title="Underline"
        >
          <UnderlineIcon size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1 rounded hover:bg-gray-300 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1 rounded hover:bg-gray-300 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1 rounded hover:bg-gray-300 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
         <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1 rounded hover:bg-gray-300 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded hover:bg-gray-300 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded hover:bg-gray-300 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="p-1 rounded hover:bg-gray-300"
          title="Insert Table"
        >
          <TableIcon size={18} />
        </button>

        {editor.can().addColumnBefore() && (
            <>
                <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>
                <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1 rounded hover:bg-gray-300" title="Add Column">
                    <Plus size={14} className="rotate-90" />
                </button>
                <button onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1 rounded hover:bg-gray-300" title="Add Row">
                    <Plus size={14} />
                </button>
                <button onClick={() => editor.chain().focus().deleteColumn().run()} className="p-1 rounded hover:bg-gray-300 text-red-600" title="Delete Column">
                    <Trash2 size={14} className="rotate-90" />
                </button>
                <button onClick={() => editor.chain().focus().deleteRow().run()} className="p-1 rounded hover:bg-gray-300 text-red-600" title="Delete Row">
                    <Trash2 size={14} />
                </button>
                <button onClick={() => editor.chain().focus().deleteTable().run()} className="p-1 rounded hover:bg-gray-300 text-red-800 font-bold text-xs" title="Delete Table">
                    DEL
                </button>
            </>
        )}
      </div>
    </div>
  )
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Underline,
      Image,
      Link.configure({
          openOnClick: false,
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose max-w-none focus:outline-none p-4 h-full min-h-[200px]',
        },
    },
  });

  // Sync external value changes if necessary (caution: can cause loops if not handled)
  // Ideally we rely on initial content for this use case, or use useEffect with deep compare
  // For this simple admin, we trust the editor state mostly.

  return (
    <div className={`flex flex-col border border-gray-300 rounded overflow-hidden bg-white text-black ${className || ''}`}>
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto bg-white cursor-text" onClick={() => editor?.chain().focus().run()}>
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
};

export default RichTextEditor;
