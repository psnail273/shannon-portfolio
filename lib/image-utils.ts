/**
 * Derives alt text from an image src URL by extracting the filename,
 * stripping the extension, and replacing dashes/underscores with spaces.
 */
export function altTextFromSrc(src: string): string {
  return src.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') || '';
}
