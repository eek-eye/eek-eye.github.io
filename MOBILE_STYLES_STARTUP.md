# Mobile Styles for startup.html

This document shows all the CSS rules that apply when viewing `startup.html` on mobile devices (max-width: 768px and 480px).

## Mobile Breakpoints
- **Tablet/Mobile**: `@media (max-width: 768px)`
- **Small Mobile**: `@media (max-width: 480px)`

---

## Styles from startup.html (Inline Styles)

### Hero Buttons (max-width: 768px)
```css
@media (max-width: 768px) {
    .hero-buttons-venn {
        bottom: 3rem;  /* Changed from 13rem */
    }
    .hero-explore-btn, .hero-designs-btn {
        width: 9rem;        /* Changed from 15rem */
        height: 9rem;       /* Changed from 15rem */
        font-size: 0.65rem; /* Changed from 1rem */
        margin-left: -1.2rem; /* Changed from -2.5rem */
    }
}
```

### Hero Content (max-width: 768px)
```css
@media (max-width: 768px) {
    .hero-content h1 {
        font-size: 2.5rem;  /* Changed from 4.5rem */
    }
    .hero-content p {
        font-size: 1.2rem;  /* Changed from 1.8rem */
    }
    .hero-description-box {
        top: 1rem;          /* Changed from 2.5rem */
        right: 1rem;        /* Changed from 3.5rem */
        max-width: 90vw;    /* Changed from 340px */
        font-size: 1rem;    /* Changed from 1.1rem */
        padding: 0.8rem 1rem; /* Changed from 1.2rem 1.6rem */
    }
}
```

---

## Styles from css/style.css

### General Mobile Styles (max-width: 768px)
```css
@media (max-width: 768px) {
    .site-header h1 {
        font-size: 1.5rem;      /* Changed from 3rem */
        letter-spacing: 2px;     /* Changed from 0.8vw */
    }
    .hero-text h2 {
        font-size: 1.8rem;
    }
    main {
        padding: 2rem 4%;
    }
    .gallery-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }
    .gallery-image, .gallery-image-placeholder {
        height: 280px;
    }
    .gallery-item.featured {
        grid-column: span 1;
    }
}
```

### Small Mobile Styles (max-width: 480px)
```css
@media (max-width: 480px) {
    body {
        font-size: 15px;
    }
    .site-header h1 {
        font-size: 1.3rem;  /* Even smaller than 768px */
    }
    .hero-image {
        height: 40vh;
    }
    .hero-text h2 {
        font-size: 1.6rem;
    }
    .gallery-grid {
        grid-template-columns: 1fr;  /* Single column */
        gap: 2rem;
    }
}
```

### Info/Video Container (max-width: 768px)
```css
@media (max-width: 768px) {
    .info-video-container {
        grid-template-columns: 1fr;  /* Changed from 1fr 1fr */
        padding: 0 1rem;             /* Changed from 0 2rem */
        margin: 2rem 0;               /* Changed from 4rem 0 */
    }
    .info-section {
        padding: 1.5rem;              /* Changed from 2rem */
    }
    .video-section {
        padding: 1.5rem;              /* Changed from 2rem */
    }
}
```

### Gallery Section (max-width: 768px)
```css
@media (max-width: 768px) {
    .gallery {
        padding: 1.5rem 0.8rem;       /* Changed from 2rem 1rem */
    }
    .gallery-grid {
        padding: 0 0.8rem;
        gap: 1.2rem;                  /* Changed from 2rem */
    }
    .gallery-row {
        flex-direction: column;      /* Changed from row */
        gap: 1rem;
    }
    .gallery-item {
        max-width: 100%;              /* Changed from calc(33.333% - 0.67rem) */
    }
    .gallery h2 {
        font-size: 1.5rem;            /* Changed from 1.8rem */
    }
    .gallery h2::after {
        width: 40px;                  /* Changed from 60px */
    }
    .gallery p {
        font-size: 0.9rem;             /* Changed from 1rem */
    }
}
```

### Generations Section (max-width: 768px)
```css
@media (max-width: 768px) {
    .generation-item {
        grid-template-columns: 1fr;   /* Changed from 1fr 1fr */
    }
    .generation-image {
        height: 250px;                 /* Changed from 300px */
    }
}
```

### About Section (max-width: 768px)
```css
@media (max-width: 768px) {
    .about-section {
        padding: 2rem;                /* Changed from 3rem */
    }
    .about-section h2 {
        font-size: 1.5rem;             /* Changed from 1.8rem */
    }
    .about-section p {
        font-size: 1rem;               /* Changed from 1.1rem */
    }
}
```

### Design Detail Container (max-width: 768px)
```css
@media (max-width: 768px) {
    .design-detail-container {
        flex-direction: column;        /* Changed from row */
        padding: 2rem 1rem;            /* Changed from 4rem 2rem */
    }
    .design-image-container {
        max-width: 100%;               /* Changed from 500px */
    }
    .download-options {
        flex-direction: row;           /* Changed from column */
        justify-content: center;
    }
}
```

---

## Summary of Key Mobile Changes

### Typography
- **Header h1**: 3rem → 1.5rem (768px) → 1.3rem (480px)
- **Hero h1**: 4.5rem → 2.5rem
- **Hero p**: 1.8rem → 1.2rem
- **Body font**: Default → 15px (480px)

### Layout
- **Hero buttons**: 15rem × 15rem → 9rem × 9rem
- **Hero description box**: Positioned top-right → Adjusted for mobile viewport
- **Gallery**: 3 columns → 1 column (480px)
- **Info/Video**: 2 columns → 1 column
- **Generations**: 2 columns → 1 column
- **Design detail**: Row layout → Column layout

### Spacing
- Reduced padding and margins throughout
- Smaller gaps between elements
- Adjusted positioning for smaller screens

### Interactive Elements
- Buttons maintain functionality but are smaller
- Touch-friendly sizing maintained
- Navigation remains accessible

---

## Elements That DON'T Change on Mobile

These elements keep their desktop styles:
- Logo size and animation (unless header is scrolled)
- Navigation header structure
- Footer layout (uses flex-wrap)
- X-border elements
- Scroll-to-top button
- Page transition overlays

