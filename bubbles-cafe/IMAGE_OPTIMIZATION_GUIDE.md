# Image Optimization Guide for Interactive Storytelling Platform

This guide explains how to optimize images for better performance across all device types (mobile, tablet, laptop, desktop).

## Why Image Optimization Matters

- **Faster page load**: Optimized images load quicker, especially on mobile networks
- **Lower bandwidth consumption**: Smaller file sizes save data for your users
- **Better SEO**: Page speed is a ranking factor for search engines
- **Improved user experience**: No waiting for images to load
- **Reduced server costs**: Less bandwidth means lower hosting costs

## Optimization Techniques

### 1. Use Modern Image Formats

Convert images to efficient formats like WebP, which provides superior compression with good quality:

```jsx
// Instead of
<img src="/images/story-cover.jpg" alt="Story cover" />

// Use WebP with fallback
<picture>
  <source srcSet="/images/story-cover.webp" type="image/webp" />
  <source srcSet="/images/story-cover.jpg" type="image/jpeg" /> 
  <img src="/images/story-cover.jpg" alt="Story cover" />
</picture>
```

### 2. Implement Responsive Images

Serve different sized images based on device screen size:

```jsx
<img 
  src="/images/story-cover-800w.jpg" 
  srcSet="
    /images/story-cover-320w.jpg 320w,
    /images/story-cover-640w.jpg 640w,
    /images/story-cover-1280w.jpg 1280w
  "
  sizes="
    (max-width: 640px) 320px,
    (max-width: 1024px) 640px,
    1280px
  "
  alt="Story cover"
/>
```

### 3. Lazy Loading

Only load images when they're about to enter the viewport:

```jsx
<img 
  src="/images/story-image.webp" 
  loading="lazy" 
  alt="Story illustration" 
/>
```

### 4. Progressive Loading

Show a low-quality placeholder while the full image loads:

```jsx
// In your CSS
.image-container {
  position: relative;
  overflow: hidden;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: blur(10px);
  transform: scale(1.1);
  transition: opacity 0.3s ease-in-out;
}

.image-full {
  position: relative;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.image-full.loaded {
  opacity: 1;
}

// In your JSX
<div className="image-container">
  <img 
    className="image-placeholder" 
    src="/images/story-cover-tiny.jpg" 
    alt="" 
    aria-hidden="true"
  />
  <img 
    className="image-full" 
    src="/images/story-cover.jpg" 
    alt="Story cover" 
    onLoad={(e) => e.target.classList.add('loaded')}
  />
</div>
```

### 5. Image Compression

Use the included image optimization script to compress your images:

```bash
# Install dependencies
npm install sharp

# Run the optimization script
node scripts/optimize-images.js
```

## Implementation in Our Platform

We've already implemented these techniques in key areas:

1. **Story content images**: All images in story content use lazy loading and WebP conversion:

```jsx
dangerouslySetInnerHTML={{
  __html: sanitizeHtmlContent(currentPost.content.rendered)
    .replace(/<img/g, '<img loading="lazy" decoding="async" onload="this.classList.add(\'loaded\')"')
}}
```

2. **Responsive reader layout**: The reader adapts to different screen sizes and correctly sizes images:

```jsx
<div
  className="story-content mb-8 mx-auto w-full md:w-[95%] lg:w-[90%] xl:w-[85%]"
  style={{
    whiteSpace: 'pre-wrap',
    letterSpacing: '0.01em'
  }}
>
  {/* Content with optimized images here */}
</div>
```

## Next Steps

To further optimize your images:

1. **Run the optimization script** on all images in the `public/images` directory
2. **Update image references** in your code to use the optimized versions
3. **Add responsive image sizes** to any remaining static `<img>` tags
4. **Test loading speed** across different device types and network conditions

## Resources

- [Web.dev Guide to Image Optimization](https://web.dev/articles/fast-load-time)
- [MDN Responsive Images Guide](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Sharp Image Processing Library](https://sharp.pixelplumbing.com/)