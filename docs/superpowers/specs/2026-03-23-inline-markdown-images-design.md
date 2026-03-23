# Inline Markdown Images in Project Descriptions

## Summary

Add the ability to drag-and-drop images into the project description textarea in the admin form. Dropped images upload to Cloudinary, get saved to the `image` database table (for accurate dimensions), and insert standard markdown image syntax at the cursor position. On the public site, inline images render as optimized Next.js `<Image>` components with accurate width/height via a custom react-markdown override.

## Motivation

Project descriptions already support markdown, but authors have no way to include images inline. This feature lets authors embed images directly in the description text, appearing alongside the written content on the project detail page.

## Design

### Touch Points

1. `components/admin-project-form/admin-project-form.tsx` — drop handler on description textarea
2. `components/galleryItem/galleryItem.tsx` — custom `img` component override on `<Markdown>`
3. `lib/db.ts` — new query to fetch image dimensions by URLs, and a function to upsert a single image

### 1. Textarea Drop Handler (Admin Form)

Add `onDrop` and `onDragOver` handlers to the existing description `<textarea>` in `admin-project-form.tsx`.

**Flow:**

1. User drops an image file onto the description textarea.
2. Validate file type (JPEG, PNG, WebP — same accepted types as existing image upload).
3. Insert a uniquely-identified placeholder text `![Uploading image-{id}...]()` at the current cursor position (using a counter or timestamp to distinguish concurrent uploads).
4. POST the file to the existing `/api/upload/cloudinary` endpoint using `fetch`. The endpoint returns `{ src, width, height }`.
5. On success: upsert the image into the `image` database table (src, alt, width, height) via a server action, then replace the placeholder with `![image](cloudinary-url)`.
6. On failure: remove the placeholder text.

**Implementation details:**

- Add `useRef` (not currently imported) to the component to get a ref on the textarea for cursor position tracking.
- Use unique placeholder IDs (e.g., timestamp) so concurrent uploads replace the correct placeholder.
- After programmatically updating `description` state, restore cursor position using `requestAnimationFrame` to set `selectionStart`/`selectionEnd` after React re-renders.
- Reuse the same file validation logic (accepted MIME types) from the existing `image-upload` component.
- No progress bar — the placeholder text serves as the upload indicator.
- Prevent the browser's default drop behavior (opening the file).
- Native file drop events (from OS file manager) are distinct from `@dnd-kit`'s pointer-based drag events used for image reordering elsewhere in the form. Check `e.dataTransfer.files.length > 0` before handling to ensure we only act on file drops, not internal drag operations.
- Use the filename (without extension) as default alt text instead of a generic "image" string.

### 2. Image Storage

On successful Cloudinary upload, upsert the image into the `image` database table:

- **src**: Cloudinary URL (primary key)
- **alt**: filename-derived alt text
- **width**: actual width from Cloudinary response
- **height**: actual height from Cloudinary response
- **order**: 0 (not used for inline images)

Add a new function in `lib/db.ts` (e.g., `upsertImage`) that performs an `INSERT ... ON CONFLICT (src) DO UPDATE` — the same pattern already used in `createProject` and `updateProject`. Call this via a new server action in `lib/actions.ts`.

Inline images are NOT added to the `project_image` join table. They are tracked in the `image` table for dimension lookup but are not gallery images.

### 3. Custom Markdown Image Renderer (Gallery Item)

Add a `components` prop to the `<Markdown>` component in `galleryItem.tsx` that overrides the default `img` element with Next.js `<Image>` using accurate dimensions from the database.

**Flow at render time:**

1. Extract all image URLs from `project.description` (regex or simple parse for markdown image syntax).
2. Query the `image` table for those URLs to get their dimensions. Add a new function in `lib/db.ts` (e.g., `getImagesByUrls`) that takes an array of URLs and returns their src/width/height.
3. Build a lookup map: `{ [src]: { width, height } }`.
4. Pass the map into the custom `img` component via closure.

**Implementation:**

```tsx
const imageDimensions = await getImagesByUrls(imageUrls);
const dimensionMap = Object.fromEntries(
  imageDimensions.map(img => [img.src, { width: img.width, height: img.height }])
);

<Markdown components={{
  img: ({ src, alt }) => {
    const dims = dimensionMap[src || ''] || { width: 800, height: 600 };
    return (
      <Image
        src={ src || '' }
        alt={ alt || '' }
        width={ dims.width }
        height={ dims.height }
        className="object-contain w-full"
      />
    );
  }
}}>{ project.description }</Markdown>
```

**Details:**

- Uses Next.js `<Image>`, which automatically uses the custom Cloudinary loader from `next.config.ts`.
- Falls back to 800x600 if an image URL is not found in the database (e.g., manually typed URLs).
- `GalleryItem` is already a server component (`async function`), so the DB query runs server-side with no client overhead.
- The `components` prop with render functions works in server components since `react-markdown` renders synchronously.
- The existing Tailwind `prose` container with `lg:max-w-[300px]` constrains display width; the accurate aspect ratio from the database prevents stretching or distortion.

### What Does NOT Change

- **Database schema** — the existing `image` table already has the right columns. No migrations needed.
- **API endpoints** — reuses the existing `/api/upload/cloudinary` endpoint.
- **Dependencies** — `react-markdown` already supports `components` overrides; Next.js `<Image>` is already imported.
- **Type definitions** — `description` is already a `string` in `ProjectType`.
- **`project_image` table** — inline images are not added to this join table.
