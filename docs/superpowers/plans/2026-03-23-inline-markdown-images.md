# Inline Markdown Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable drag-and-drop image uploads in project description textareas, with inline images rendered as optimized Next.js `<Image>` components using accurate dimensions from the database.

**Architecture:** Two new DB functions (`upsertImage`, `getImagesByUrls`) plus one server action (`upsertImageAction`). A drop handler on the admin form textarea uploads to Cloudinary and inserts markdown syntax. A custom react-markdown `img` override renders inline images with accurate dimensions.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Neon Postgres, Cloudinary, react-markdown

**Spec:** `docs/superpowers/specs/2026-03-23-inline-markdown-images-design.md`

---

### Task 1: Add `upsertImage` and `getImagesByUrls` to `lib/db.ts`

**Files:**
- Modify: `lib/db.ts`

- [ ] **Step 1: Add `upsertImage` function**

Add after the existing `getImageBySlug` function (around line 47):

```typescript
export async function upsertImage(
  image: { src: string; alt: string; width: number; height: number }
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO image (src, alt, width, height, "order")
    VALUES (${image.src}, ${image.alt}, ${image.width}, ${image.height}, 0)
    ON CONFLICT (src) DO UPDATE SET alt = ${image.alt}, width = ${image.width}, height = ${image.height}
  `;
}
```

This follows the same `ON CONFLICT` pattern used in `createProject` (line 105-107).

- [ ] **Step 2: Add `getImagesByUrls` function**

Add immediately after `upsertImage`:

```typescript
export async function getImagesByUrls(
  urls: string[]
): Promise<{ src: string; width: number; height: number }[]> {
  if (urls.length === 0) return [];
  const sql = getSql();
  const response = await sql`
    SELECT src, width, height FROM image WHERE src = ANY(${urls})
  `;
  return response as unknown as { src: string; width: number; height: number }[];
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Builds without errors (new functions are exported but unused yet)

- [ ] **Step 4: Commit**

```bash
git add lib/db.ts
git commit -m "feat: add upsertImage and getImagesByUrls DB functions"
```

---

### Task 2: Add `upsertImageAction` server action

**Files:**
- Modify: `lib/actions.ts`

- [ ] **Step 1: Import `upsertImage` from db**

Update the import on line 6:

```typescript
import { createProject, updateProject, deleteProject, updateProjectOrder, upsertImage } from './db';
```

- [ ] **Step 2: Add the server action**

Add after `deleteProjectAction` (after line 187):

```typescript
export async function upsertImageAction(
  image: { src: string; alt: string; width: number; height: number }
): Promise<ActionResult> {
  if (!await verifyAdminAuth()) {
    return { success: false, error: 'Not authenticated.' };
  }

  if (!image.src || !image.src.startsWith('https://')) {
    return { success: false, error: 'Valid image URL is required.' };
  }
  if (!image.alt || !image.alt.trim()) {
    return { success: false, error: 'Alt text is required.' };
  }
  if (!image.width || image.width <= 0 || !image.height || image.height <= 0) {
    return { success: false, error: 'Valid dimensions are required.' };
  }

  try {
    await upsertImage({
      src: image.src.trim(),
      alt: image.alt.trim(),
      width: image.width,
      height: image.height,
    });
    return { success: true };
  } catch (err: unknown) {
    console.error('upsertImageAction error:', err);
    return { success: false, error: 'Failed to save image. Please try again.' };
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add lib/actions.ts
git commit -m "feat: add upsertImageAction server action"
```

---

### Task 3: Add drop handler to description textarea

**Files:**
- Modify: `components/admin-project-form/admin-project-form.tsx`

- [ ] **Step 1: Update imports**

Change line 3 from:
```typescript
import { useState, useId, useCallback } from 'react';
```
to:
```typescript
import { useState, useId, useCallback, useRef } from 'react';
```

Update line 5 to include the new action:
```typescript
import { createProjectAction, updateProjectAction, upsertImageAction } from '@/lib/actions';
```

- [ ] **Step 2: Add accepted types constant and ref inside the component**

Inside `AdminProjectForm`, after line 165 (`const [slugTouched, setSlugTouched] = ...`), add:

```typescript
const descriptionRef = useRef<HTMLTextAreaElement>(null);

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
```

- [ ] **Step 3: Add the drop handler function**

Add after the `ACCEPTED_IMAGE_TYPES` constant:

```typescript
const handleDescriptionDrop = useCallback(async (e: React.DragEvent<HTMLTextAreaElement>) => {
  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;

  // Always prevent default for file drops to stop browser navigation
  e.preventDefault();
  e.stopPropagation();

  const file = files[0];
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return;

  const textarea = descriptionRef.current;
  const cursorPos = textarea?.selectionStart ?? 0;
  const placeholderId = Date.now();
  const placeholder = `![Uploading image-${placeholderId}...]()`;

  // Insert placeholder at cursor position using functional setState to avoid stale closure
  setDescription((prev) => {
    const before = prev.slice(0, cursorPos);
    const after = prev.slice(cursorPos);
    return `${before}${placeholder}${after}`;
  });

  // Restore cursor position after React re-render
  const newCursorPos = cursorPos + placeholder.length;
  requestAnimationFrame(() => {
    if (textarea) {
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
    }
  });

  // Upload to Cloudinary
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/upload/cloudinary', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const { src, width, height } = await res.json();

    // Derive alt text from filename
    const altText = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');

    // Upsert image to database for dimension tracking
    await upsertImageAction({ src, alt: altText, width, height });

    // Replace placeholder with actual markdown
    setDescription((prev) => prev.replace(placeholder, `![${altText}](${src})`));
  } catch {
    // Remove placeholder on failure
    setDescription((prev) => prev.replace(placeholder, ''));
  }
}, []);

const handleDescriptionDragOver = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
  if (e.dataTransfer?.types?.includes('Files')) {
    e.preventDefault();
    e.stopPropagation();
  }
}, []);
```

- [ ] **Step 4: Update the textarea JSX**

Replace the textarea (lines 378-385) with:

```tsx
<textarea
  id="description"
  ref={ descriptionRef }
  value={ description }
  onChange={ (e) => setDescription(e.target.value) }
  onDrop={ handleDescriptionDrop }
  onDragOver={ handleDescriptionDragOver }
  className={ `${inputClass} min-h-[120px] resize-y` }
  placeholder="Project description (supports Markdown). Drop images here to upload."
  required
/>
```

- [ ] **Step 5: Verify build**

Run: `npm run build`

- [ ] **Step 6: Manual test**

1. Run `npm run dev` and navigate to admin
2. Create or edit a project
3. Drag an image file from the OS file manager onto the description textarea
4. Verify: placeholder `![Uploading image-...]()` appears, then gets replaced with `![filename](cloudinary-url)`
5. Verify: the DnD Kit image reordering still works independently

- [ ] **Step 7: Commit**

```bash
git add components/admin-project-form/admin-project-form.tsx
git commit -m "feat: add drag-and-drop image upload to description textarea"
```

---

### Task 4: Add custom markdown image renderer

**Files:**
- Modify: `components/galleryItem/galleryItem.tsx`

- [ ] **Step 1: Import `getImagesByUrls`**

Add to the top of the file:

```typescript
import { getImagesByUrls } from '@/lib/db';
```

- [ ] **Step 2: Add image URL extraction and dimension lookup**

Inside the `GalleryItem` function, before the `return`, add:

```typescript
// Extract image URLs from markdown description
const imageUrlRegex = /!\[.*?\]\((.*?)\)/g;
const imageUrls: string[] = [];
let match;
while ((match = imageUrlRegex.exec(project.description)) !== null) {
  if (match[1]) imageUrls.push(match[1]);
}

// Fetch dimensions from database
const imageDimensions = await getImagesByUrls(imageUrls);
const dimensionMap: Record<string, { width: number; height: number }> = {};
for (const img of imageDimensions) {
  dimensionMap[img.src] = { width: img.width, height: img.height };
}
```

- [ ] **Step 3: Add components override to Markdown**

Replace the `<Markdown>` call (line 23) with:

```tsx
<Markdown components={ {
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
} }>{ project.description }</Markdown>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`

- [ ] **Step 5: Manual test**

1. Run `npm run dev`
2. Navigate to a project that has inline images in its description (from Task 3 testing)
3. Verify: inline images render as Next.js `<Image>` components (check the HTML — should have Cloudinary transform params in the `src`)
4. Verify: images maintain correct aspect ratio, no stretching
5. Verify: existing gallery images above the description still render correctly

- [ ] **Step 6: Commit**

```bash
git add components/galleryItem/galleryItem.tsx
git commit -m "feat: render inline markdown images as optimized Next.js Image components"
```

---

### Task 5: Final verification and lint

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Fix any issues.

- [ ] **Step 2: Run full build**

Run: `npm run build`
Expected: Clean build with no errors or warnings.

- [ ] **Step 3: End-to-end manual test**

1. Start dev server
2. Admin: create a new project, type some markdown in description, drop an image mid-text
3. Verify upload completes and markdown syntax is inserted
4. Save the project
5. Public site: navigate to the project detail page
6. Verify: inline image appears within the description text at the correct position, with proper aspect ratio
7. Verify: gallery images (above description) still render correctly
8. Verify: other projects without inline images are unaffected

- [ ] **Step 4: Commit any lint fixes**

```bash
git add -A
git commit -m "chore: lint fixes for inline markdown images"
```
