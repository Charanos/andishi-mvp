# Rich Text Editor Integration Guide

This document explains how to integrate **react-quill-new** (Quill v2 compatible, React 19 ready) into the Andishi-MVP codebase for both **blog creation/editing** and **blog rendering**.

---

## 1. Why `react-quill-new`?

| Package               | React 19 Support | Bundle Size | Maturity                                  |
| --------------------- | ---------------- | ----------- | ----------------------------------------- |
| `react-quill`         | ❌ (peer ≤ 18)   | 117 KB      | Widely used                               |
| **`react-quill-new`** | ✅ (≥ 16 → 19)   | 118 KB      | Fork of `react-quill` w/ updated peerDeps |

We already installed it:

```bash
npm install react-quill-new quill
```

> If you need image uploads or advanced features later, the Quill ecosystem provides drop-ins (e.g. `quill-image-uploader`).

---

## 2. Folder Structure Proposal

```
app/
 └─ components/
     ├─ BlogForm.tsx          # already exists → we will embed editor here
     ├─ RichTextEditor.tsx    # ✨ new reusable wrapper around react-quill-new
     └─ RichTextViewer.tsx    # ✨ renders saved HTML safely
```

---

## 3. Creating the Reusable Editor Component

`app/components/RichTextEditor.tsx`

```tsx
"use client";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // base Quill styles
import "./quill-custom.css"; // optional custom styling

// Quill requires `window`. Use dynamic import to avoid SSR issues.
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      modules={modules}
      formats={formats}
      className="bg-gray-800/50 text-white border border-gray-600 rounded-lg" // Tailwind overrides
    />
  );
}

// Toolbar + module configuration
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
};
const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "code-block",
  "link",
  "image",
];
```

Add optional `quill-custom.css` (dark theme adjustments) or Tailwind classes.

---

## 4. Updating `BlogForm.tsx`

1. **Import** the component:

```tsx
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
});
```

2. **Replace** the current `<textarea name="content" …>` block with:

```tsx
<RichTextEditor
  value={formData.content}
  onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
  placeholder="Write engaging content…"
/>
```

3. **Validation** stays the same – we still store HTML string in `formData.content`.

---

## 5. Rendering Rich Content in `[id]/page.tsx`

Create `RichTextViewer.tsx`:

```tsx
import DOMPurify from "isomorphic-dompurify";
interface Props {
  html: string;
}
export default function RichTextViewer({ html }: Props) {
  return (
    <div
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
```

Then in `EnhancedBlogPostPage` swap `renderBlogContent(blog.content)` with:

```tsx
<RichTextViewer html={blog.content} />
```

You can still keep special blocks (quotes, highlights) if you parse for custom markers; Quill’s HTML already contains `<blockquote>`, `<pre>`, `<img>`, etc. which Tailwind’s `prose` classes style nicely.

> **Security**: Using `isomorphic-dompurify` prevents XSS. Install it:
>
> ```bash
> npm install isomorphic-dompurify
> ```

---

## 6. Styling Tips

- Tailwind Typography (`@tailwindcss/typography`) is already in the project; combine with `prose-invert` for dark mode.
- Override Quill’s snow theme background/borders to fit your dark UI (`quill-custom.css`).
- For inline code blocks, add:

```css
.prose pre {
  @apply bg-gray-900 border border-gray-700 rounded-lg;
}
```

---

## 7. Database & API

We’re already saving `content` as HTML string via Prisma. No migration needed.
If you want **markdown**, you can switch Quill to output markdown using `quilljs-markdown` later.

---

## 8. Testing Checklist ✅

1. Create a post in admin mode – ensure editor loads and saves.
2. Check API payload – `content` should contain rich HTML.
3. View `/blogs/[id]` – verify content styles, images, code, lists.
4. Test XSS by inserting `<script>alert(1)</script>` → should be sanitized.
5. Mobile responsiveness – check editor (creation) only on desktop.

---

## 9. Future Enhancements

- **Image Uploads**: integrate `quill-image-uploader` with an S3/Cloudinary endpoint.
- **Syntax Highlighting**: add `highlight.js` for code blocks.
- **Word Count & Read Time**: compute on save using `quill.getText().split(/\s+/).length`.

---

Happy writing! 🎉
