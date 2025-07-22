# CSS Standardization Guidelines

## Z-Index System

To avoid "z-index wars" and ensure consistent layering of UI components, we'll establish a standardized z-index scale.

### Z-Index Layers

| Layer               | Z-Index Range | Description                                 |
|---------------------|---------------|---------------------------------------------|
| Background          | -1 to -10     | Background elements below content           |
| Base Content        | 0 to 10       | Regular page content                        |
| Floating UI         | 20 to 40      | Dropdowns, tooltips, floating elements      |
| Sticky Navigation   | 50 to 70      | Headers, footers, sticky elements           |
| Modal Overlays      | 80 to 90      | Modal backgrounds                           |
| Modals              | 100 to 200    | Modal content, dialogs                      |
| Notifications       | 300 to 400    | Toasts, notification banners                |
| Critical UI         | 500 to 900    | Critical messages, error notifications      |
| Loading/Overlay     | 1000          | Global loading indicators                   |

### Implementation Guidelines

1. **Avoid arbitrary high values** like 9999
2. **Use variables** rather than hardcoded values
3. **Document when using z-index** with a comment explaining why
4. **Use the minimum value necessary** for your use case
5. **Never use !important** with z-index

## Responsive Design System

To ensure consistent behavior across devices, we'll standardize our breakpoint system.

### Breakpoint Scale

| Breakpoint Name | Size (px) | CSS Variable     | Description         |
|-----------------|-----------|------------------|---------------------|
| xs              | 480px     | --breakpoint-xs  | Extra small devices |
| sm              | 640px     | --breakpoint-sm  | Small devices       |
| md              | 768px     | --breakpoint-md  | Medium devices      |
| lg              | 1024px    | --breakpoint-lg  | Large devices       |
| xl              | 1280px    | --breakpoint-xl  | Extra large devices |
| 2xl             | 1536px    | --breakpoint-2xl | 2X large devices    |

### Media Query Templates

```css
/* Mobile First (recommended) */
@media (min-width: var(--breakpoint-sm)) {
  /* Small devices and up */
}

@media (min-width: var(--breakpoint-md)) {
  /* Medium devices and up */
}

/* Desktop First (alternative) */
@media (max-width: calc(var(--breakpoint-md) - 1px)) {
  /* Smaller than medium devices */
}
```

### Implementation Guidelines

1. **Use the defined breakpoints** rather than arbitrary pixel values
2. **Prefer min-width over max-width** queries for mobile-first development
3. **Use Tailwind's responsive classes** when possible instead of custom media queries
4. **Test thoroughly** on various devices and screen sizes

## Best Practices

1. **CSS Variables**: Use variables for colors, spacing, and other values to maintain consistency
2. **Avoid Inline Styles**: Keep styling in CSS/SCSS files whenever possible
3. **Component-Specific Styling**: Use scoped/modular CSS approaches
4. **Performance**: Be mindful of selector specificity and avoid deeply nested selectors
5. **Documentation**: Comment complex CSS and document any exceptions to these guidelines

These guidelines aim to create a more consistent, maintainable, and reliable UI across the application.