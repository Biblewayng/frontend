import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: { class: 'prose prose-sm max-w-none min-h-[120px] px-3 py-2 focus:outline-none' },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="flex flex-wrap gap-1 px-2 py-1 border-b border-gray-200 bg-gray-50">
        {[
          { label: 'B', action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold') },
          { label: 'I', action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic') },
          { label: 'U', action: () => editor?.chain().focus().toggleUnderline?.().run(), active: editor?.isActive('underline') },
          { label: 'H1', action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), active: editor?.isActive('heading', { level: 1 }) },
          { label: 'H2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }) },
          { label: 'OL', action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList') },
          { label: 'UL', action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList') },
        ].map(({ label, action, active }) => (
          <button key={label} type="button" onMouseDown={e => { e.preventDefault(); action(); }}
            className={`px-2 py-0.5 text-xs rounded font-medium ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>
      {!editor?.getText() && placeholder && !editor?.isFocused && (
        <p className="absolute px-3 py-2 text-sm text-gray-400 pointer-events-none">{placeholder}</p>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
