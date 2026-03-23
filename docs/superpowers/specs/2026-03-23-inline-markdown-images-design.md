# Inline Markdown Images in Project Descriptions

## Summary

Add the ability to drag-and-drop images into the project description textarea in the admin form. Dropped images upload to Cloudinary and insert standard markdown image syntax at the cursor position. On the public site, inline images render as optimized Next.js `<Image>` components via a custom react-markdown override.

## Motivation

Project descriptions already support markdown, but authors have no way to include images inline. This feature lets authors embed images directly in the description text, appearing alongside the written content on the project detail page.

## Design

### Touch Points

Two files are modified. No new files, dependencies, database changes, or API endpoints.

1. `components/admin-project-form/admin-project-form.tsx` — drop handler on description textarea
2. `components/galleryItem/galleryItem.tsx` — custom `img` component override on `<Markdown>`

### 1. Textarea Drop Handler (Admin Form)

Add `onDrop` and `onDragOver` handlers to the existing description `<textarea>` in `admin-project-form.tsx`.

**Flow:**

1. User drops an image file onto the description textarea.
2. Validate file type (JPEG, PNG, WebP — same accepted types as existing image upload).
3. Insert placeholder text `![Uploading image...]()` at the current cursor position.
4. POST the file to the existing `/api/upload/cloudinary` endpoint using `fetch`.
5. On success: replace the placeholder with `![image](cloudinary-url)`.
6. On failure: replace the placeholder with `![Upload failed]()` or remove it.

**Implementation details:**

- Add a `ref` to the textarea to track cursor position for placeholder insertion.
- Programmatically update the `description` state when inserting/replacing placeholder text.
- Reuse the same file validation logic (accepted MIME types) from the existing `image-upload` component.
- No progress bar — the placeholder text serves as the upload indicator.
- Prevent the browser's default drop behavior (opening the file).

### 2. Custom Markdown Image Renderer (Gallery Item)

Add a `components` prop to the `<Markdown>` component in `galleryItem.tsx` that overrides the default `img` element.

**Implementation:**

```tsx
<Markdown components={{
  img: ({ src, alt }) => (
    <Image
      src={ src || '' }
      alt={ alt || '' }
      width={ 800 }
      height={ 600 }
      className="object-contain w-full"
    />
  )
}}>{ project.description }</Markdown>
```

**Details:**

- Uses Next.js `<Image>` component, which automatically uses the custom Cloudinary loader configured in `next.config.ts`.
- Default `width={800}` and `height={600}` as layout size hints. Actual display is controlled by `w-full` and `object-contain` CSS. Cloudinary handles responsive delivery via the loader.
- Non-Cloudinary URLs pass through the loader unchanged, so any image URL works.
- The existing Tailwind `prose` container already provides appropriate image styling.

### What Does NOT Change

- **Database schema** — inline images are referenced only by URL in the markdown text, not tracked in the `image` or `project_image` tables.
- **API endpoints** — reuses the existing `/api/upload/cloudinary` endpoint.
- **Dependencies** — `react-markdown` already supports `components` overrides; Next.js `<Image>` is already imported.
- **Type definitions** — `description` is already a `string` in `ProjectType`.

## Image Storage

Inline description images upload to the same Cloudinary folder as gallery images but are NOT added to the `project_image` join table. They exist only as URLs embedded in the markdown text.
