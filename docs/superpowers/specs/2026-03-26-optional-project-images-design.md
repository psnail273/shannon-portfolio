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

### 3. Home Gallery (`components/gallery/gallery.tsx`)

Currently, `filteredImages` filters out projects with `images.length === 0` (line 44-45). Change this to include imageless projects.

**Imageless project card:**
- Displays the word "Blog" as visual content instead of a thumbnail image
- "Blog" text: large, centered, Playfair Display font to match site aesthetic
- Fixed aspect ratio (e.g. 4:3) so the card has visual presence in the masonry grid
- Same hover overlay as image cards: `bg-accent/75` fades in with title + types text sliding up
- Links to `/designs/[slug]` like all other cards
- Participates in the same filter logic (filtered by project types)
- Uses the same slide-in entrance animation as image cards

## Out of Scope

- No database schema changes (the LEFT JOIN + COALESCE already handles projects with no images, returning an empty array)
- No changes to server actions (`createProjectAction`, `updateProjectAction`) — they already pass through the images array as-is
- No changes to inline markdown image support in descriptions
- No changes to the image upload component itself
