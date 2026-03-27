# Optional Project Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make gallery images optional when creating/editing projects, with a full-width description layout for imageless projects and "Blog" placeholder cards in the home gallery.

**Architecture:** Four targeted edits: remove image validation from admin form and server actions, add conditional layout in the project detail component, and rework the home gallery to support imageless project cards.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-03-26-optional-project-images-design.md`

---

### Task 1: Remove server-side image validation

**Files:**
- Modify: `lib/actions.ts:40-42`

- [ ] **Step 1: Remove the image requirement check**

In `lib/actions.ts`, delete lines 40-42 from the `validateProjectData` function:

```typescript
// DELETE these lines:
if (!data.images || data.images.length === 0) {
  return 'At least one image is required.';
}
```

The per-image validation loop (lines 43-57) already handles an empty array gracefully by skipping iteration.

- [ ] **Step 2: Verify the build passes**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add lib/actions.ts
git commit -m "feat: remove server-side image requirement for projects"
```

---

### Task 2: Remove client-side image validation in admin form

**Files:**
- Modify: `components/admin-project-form/admin-project-form.tsx:329-333,464`

- [ ] **Step 1: Remove the client-side image validation block**

In `components/admin-project-form/admin-project-form.tsx`, delete lines 329-333 from the `handleSubmit` function:

```typescript
// DELETE these lines:
if (validImages.length === 0) {
  setError('At least one image is required. Upload an image for each slot.');
  setIsSubmitting(false);
  return;
}
```

- [ ] **Step 2: Change the "Images *" label to "Images"**

On line 464, change:

```tsx
<span className={ labelClass }>Images *</span>
```

to:

```tsx
<span className={ labelClass }>Images</span>
```

- [ ] **Step 3: Verify the build passes**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add components/admin-project-form/admin-project-form.tsx
git commit -m "feat: make images optional in admin project form"
```

---

### Task 3: Conditional layout in project detail page

**Files:**
- Modify: `components/galleryItem/galleryItem.tsx:23-63`

- [ ] **Step 1: Add conditional rendering based on images**

Replace the return JSX in `components/galleryItem/galleryItem.tsx` (lines 23-64) with:

```tsx
const hasImages = project.images.length > 0;

return (
  <div className={ `flex flex-col ${hasImages ? 'lg:flex-row' : ''} gap-8 lg:gap-10 justify-between items-start px-8` }>
    { hasImages && (
      <div className="flex flex-col gap-4 w-full">
        { project.images.map((img) => (
          <Image
            key={ img.src }
            src={ img.src }
            alt={ img.alt || altTextFromSrc(img.src) }
            width={ img.width }
            height={ img.height }
            className="object-contain w-full"
          />
        )) }
      </div>
    ) }
    <div className={ `flex flex-col gap-8 ${hasImages ? 'lg:max-w-[300px]' : 'w-full'}` }>
      <div className="text-4xl font-playfair capitalize">{ project.title }</div>
      <div className="prose prose-md dark:prose-invert">
        <Markdown
          components={ {
            img: (props) => {
              const imgSrc = String(props.src || '');
              const imgAlt = String(props.alt || '');
              const dims = dimensionMap[imgSrc] || { width: 800, height: 600 };
              return (
                <Image
                  src={ imgSrc }
                  alt={ imgAlt }
                  width={ dims.width }
                  height={ dims.height }
                  className="object-contain w-full"
                />
              );
            }
          } }
        >
          { project.description }
        </Markdown>
      </div>
      <hr className="w-full h-[2px] border-none bg-muted/30"/>
    </div>
  </div>
);
```

Key changes:
- `hasImages` boolean controls whether `lg:flex-row` is applied and whether the image column renders
- Description column uses `lg:max-w-[300px]` only when images exist, otherwise `w-full`

- [ ] **Step 2: Verify the build passes**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add components/galleryItem/galleryItem.tsx
git commit -m "feat: full-width description layout for imageless projects"
```

---

### Task 4: Home gallery support for imageless project cards

**Files:**
- Modify: `components/gallery/gallery.tsx:44-99`

- [ ] **Step 1: Rework the data structure for gallery entries**

In `components/gallery/gallery.tsx`, replace the `filteredImages` computation (lines 44-51) with a new type and mapping that handles both image and imageless projects:

```tsx
interface GalleryEntry {
  slug: string;
  name: string;
  types: string[];
  hasImage: boolean;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}

// Replace the existing filteredImages (lines 44-51) with:
const galleryEntries: GalleryEntry[] = filteredProjects.map((project) => {
  const firstImage = project.images[0];
  return {
    slug: project.slug,
    name: project.title,
    types: project.types,
    hasImage: !!firstImage,
    ...(firstImage && {
      src: firstImage.src,
      alt: firstImage.alt,
      width: firstImage.width,
      height: firstImage.height,
    }),
  };
});
```

- [ ] **Step 2: Update the `allImagesLoaded` check**

Replace the existing `allImagesLoaded` line (line 53) with:

```tsx
const allImagesLoaded = galleryEntries.every(
  (entry) => !entry.hasImage || loadedImages.has(entry.slug)
);
```

This treats imageless entries as always loaded.

- [ ] **Step 3: Register imageless cards as immediately loaded**

Add a `useEffect` after the existing state hooks to register imageless projects as loaded:

```tsx
import { useEffect } from 'react'; // add to existing import

// Add after the loadedImages state declaration:
useEffect(() => {
  const imagelessSlugs = filteredProjects
    .filter((p) => p.images.length === 0)
    .map((p) => p.slug);
  if (imagelessSlugs.length > 0) {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      for (const slug of imagelessSlugs) next.add(slug);
      return next;
    });
  }
}, [filteredProjects]);
```

- [ ] **Step 4: Update the JSX to render both image and imageless cards**

Replace the `Masonry` contents (the `.map` over `filteredImages`, lines 59-99) to iterate over `galleryEntries` and conditionally render either an image card or a "Blog" text card:

```tsx
{ galleryEntries.map((entry, index) => (
  <div
    key={ selectedFilter + '-' + entry.slug }
    className="overflow-hidden"
  >
    <Link href={ `${uriPrefix}/${entry.slug}` } className="group block">
      <div
        className={ `relative flex flex-col transition-transform ease-in-out duration-500 ${
          loadedImages.has(entry.slug)
            ? 'translate-x-0'
            : '-translate-x-[calc(100%+1px)]'
        }` }
        style={ {
          transitionDelay: `${getDelayFromSlug(entry.slug)}ms`
        } }
      >
        <div className={ `${allImagesLoaded ? 'flex' : 'hidden'} absolute z-10 text-white flex-col gap-2 justify-end p-10 inset-0 bg-accent/0 group-hover:bg-accent/75 group-active:bg-accent/75 group-focus-visible:bg-accent/75 transition-colors duration-400 ease-in-out` }>
          <span
            className="text-3xl font-playfair capitalize opacity-0 transition-all duration-400 ease-in-out group-hover:-translate-y-[15px] group-hover:opacity-100 group-active:-translate-y-[15px] group-active:opacity-100 group-focus-visible:-translate-y-[15px] group-focus-visible:opacity-100"
          >{ entry.name }</span>
          <span
            className="text-xs uppercase opacity-0 transition-all duration-400 ease-in-out group-hover:-translate-y-[15px] group-hover:opacity-100 group-hover:delay-100 group-active:-translate-y-[15px] group-active:opacity-100 group-active:delay-100 group-focus-visible:-translate-y-[15px] group-focus-visible:opacity-100 group-focus-visible:delay-100"
          >{ entry.types.join(', ') }</span>
        </div>

        { entry.hasImage ? (
          <Image
            src={ entry.src! }
            alt={ entry.alt || altTextFromSrc(entry.src!) }
            width={ entry.width! }
            height={ entry.height! }
            className="object-contain"
            loading={ index < 3 ? 'eager' : 'lazy' }
            onLoad={ () => {
              setLoadedImages(prev => new Set(prev).add(entry.slug));
            } }
          />
        ) : (
          <div className="flex items-center justify-center aspect-[4/3] bg-surface border border-border-subtle">
            <span className="text-6xl font-playfair text-muted">Blog</span>
          </div>
        ) }

      </div>
    </Link>
  </div>
)) }
```

Key differences for imageless cards:
- Renders a `div` with `aspect-[4/3]` containing centered "Blog" text instead of an `<Image>`
- No `onLoad` handler needed (registered as loaded via `useEffect`)
- Same hover overlay, animation, and link behavior as image cards

- [ ] **Step 5: Verify the build passes**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 6: Commit**

```bash
git add components/gallery/gallery.tsx
git commit -m "feat: show imageless projects as Blog cards in gallery grid"
```

---

### Task 5: Manual verification

- [ ] **Step 1: Start dev server and verify**

Run: `npm run dev`

Manual checks:
1. Admin: Create a new project without any images — should submit successfully
2. Admin: Edit an existing project, remove all images — should save successfully
3. Detail page: Visit an imageless project at `/designs/[slug]` — description should fill full width, no empty image column
4. Detail page: Visit a project with images — layout should be unchanged (images left, description right)
5. Home gallery: Imageless project should appear as a "Blog" card with hover overlay showing title + types
6. Home gallery: Image-based projects should appear unchanged
7. Filters: Imageless projects should appear/disappear correctly when filtering by type

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No new lint errors

- [ ] **Step 3: Final commit if any lint fixes needed**

```bash
git add -A
git commit -m "fix: lint cleanup for optional images feature"
```
