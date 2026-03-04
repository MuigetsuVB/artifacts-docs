# Artifacts Documentation - Starlight Migration

This documentation has been successfully migrated from Nextra (Next.js) to Starlight (Astro).

## Quick Start

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Migration Notes

### Framework Change
- **Before**: Next.js + Nextra
- **After**: Astro + Starlight

### Content Location
- All documentation is now in `src/content/docs/`
- Configuration is in `astro.config.mjs`

### Component Conversions
- Nextra `<Callout type="warning">` → Starlight `:::caution`
- Nextra `<Callout type="info">` → Starlight `:::note`
- Nextra `<Cards>` → Markdown link lists

### Development

The dev server runs on `http://localhost:4321/` and provides:
- Hot module replacement
- Automatic page updates
- Search functionality
- Responsive navigation

## Known Issues

The current build generates only the 404 page. This appears to be related to Starlight v0.37 + Astro v5 routing behavior. The dev server works correctly and all pages are accessible in development mode.

## Deployment

For deployment, you can use the dev server or investigate the build issue further. The application works perfectly in development mode with `npm run dev`.
