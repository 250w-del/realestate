/**
 * Image URLs from the API may be absolute (Cloudinary) or relative (/uploads/...).
 * Relative paths are served by the API host; in Vite dev, /uploads is proxied to the backend.
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const u = url.trim()
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  if (u.startsWith('//')) return `https:${u}`
  return u
}

/** Card / hero image: primary photo if set, otherwise first image (upload order). */
export function getPropertyCoverUrl(property) {
  const imgs = property?.images
  if (!Array.isArray(imgs) || imgs.length === 0) return ''
  const primary = imgs.find(
    (img) => img.is_primary === true || img.is_primary === 1 || img.is_primary === '1'
  )
  const src = (primary || imgs[0])?.image_url
  return resolveMediaUrl(src)
}
