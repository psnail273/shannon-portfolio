# Optional Project Images

Make gallery images optional when creating/editing projects. Projects without gallery images display with a full-width description layout and appear in the home gallery as text-based "Blog" cards.

## Changes

### 1. Admin Form (`components/admin-project-form/admin-project-form.tsx`)

- Remove the validation block that rejects submission when no images are uploaded (lines 329-333: the `validImages.length === 0` check)
- Change the `Images *` label to `Images` (no longer required)
- No other form changes — the "Add Image" button, drag-to-reorder, and upload slots remain available

### 2. Project Detail Layout (`components/galleryItem/galleryItem.tsx`)

Conditional layout based on `project.images.length`:

**With images (unchanged):**
- Two-column flex layout: images left (full width column), description right (`lg:max-w-[300px]`)

**Without images:**
- Do not render the image column (the `div` containing the `project.images.map`)
- Remove the `lg:max-w-[300px]` constraint on the description/title column so it fills full width
- Title, markdown description (with inline images still supported), and HR render the same way, just wider

### 3. Server Actions (`lib/actions.ts`)

The `validateProjectData` function (lines 40-42) enforces server-side image requirement:
```
if (!data.images || data.images.length === 0) {
  return 'At least one image is required.';
}
```
Remove this check. The per-image validation loop (lines 43-57) handles an empty array gracefully (skips iteration), so no further changes needed.

### 4. Home Gallery (`components/gallery/gallery.tsx`)

Currently, `filteredImages` filters out projects with `images.length === 0` (line 44-45) and maps `project.images[0]` properties onto each entry (lines 46-51). This needs two changes:

**Data structure rework:**
- Remove the `.filter((project) => project.images.length > 0)` check
- Rework the mapping so that imageless projects produce entries with `slug`, `name`, `types`, and a flag indicating no image (e.g. `hasImage: false`), rather than trying to spread `project.images[0]` which would be `undefined`

**Imageless project card:**
- Displays the word "Blog" as visual content instead of a thumbnail image
- "Blog" text: large, centered, Playfair Display font to match site aesthetic
- Fixed aspect ratio (e.g. 4:3) so the card has visual presence in the masonry grid
- Same hover overlay as image cards: `bg-accent/75` fades in with title + types text sliding up
- Links to `/designs/[slug]` like all other cards
- Participates in the same filter logic (filtered by project types)

**Animation/loading:**
- The current slide-in animation relies on `onLoad` from `<Image>` elements and `allImagesLoaded` to control hover overlay visibility
- Imageless cards must register as immediately loaded (add slug to `loadedImages` set at render time or treat them as pre-loaded in the `allImagesLoaded` check) so they participate in the entrance animation correctly

## Out of Scope

- No database schema changes (the LEFT JOIN + COALESCE already handles projects with no images, returning an empty array)
- No changes to `createProject`/`updateProject` in `lib/db.ts` — the transaction code spreads over the images array, which works correctly when empty
- No changes to inline markdown image support in descriptions
- No changes to the image upload component itself
