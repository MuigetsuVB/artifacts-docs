# Artifacts Documentation

This repository contains the documentation for [Artifacts](https://artifactsmmo.com), an API-based MMORPG. The documentation is built using [Nextra](https://nextra.site), a static site generator built on top of Next.js.

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn package manager

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MuigetsuVB/artifacts-docs.git
   cd artifacts-docs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the documentation site.

### Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build the site for production
- `npm run start` - Start the production server

## Project Structure

```
artifacts-docs/
├── pages/                    # Documentation pages
│   ├── _meta.json           # Root navigation configuration
│   ├── index.mdx            # Homepage
│   ├── quickstart/          # Quickstart guide pages
│   │   ├── _meta.json       # Quickstart navigation
│   │   ├── introduction.mdx
│   │   ├── first_fight.mdx
│   │   └── ...
│   ├── concepts/            # Game concepts pages
│   ├── api_guide/           # API guide pages
│   ├── resources/           # Resources pages
│   └── others/              # Other pages
├── theme.config.tsx         # Nextra theme configuration
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies and scripts
```

## How to Modify Documentation

### Adding a New Page

1. **Create a new `.mdx` file** in the appropriate directory under `pages/`:
   ```bash
   # Example: Add a new concept page
   touch pages/concepts/my-new-concept.mdx
   ```

2. **Add basic content** to your new file:
   ```mdx
   # My New Concept
   
   This is a new documentation page about an important concept.
   
   ## Overview
   
   Explain your concept here...
   ```

3. **Update the navigation** by editing the corresponding `_meta.json` file:
   ```json
   {
     "actions": "Actions",
     "maps_and_movement": "Maps and Movement", 
     "my-new-concept": "My New Concept",
     "skills": "Skills"
   }
   ```

### Editing Existing Pages

1. **Find the file** you want to edit in the `pages/` directory
2. **Edit the `.mdx` file** using Markdown syntax with MDX extensions
3. **Save the file** - changes will be reflected immediately in development mode

### Creating a New Section

1. **Create a new directory** under `pages/`:
   ```bash
   mkdir pages/my-new-section
   ```

2. **Create a `_meta.json` file** for navigation:
   ```json
   {
     "page-one": "First Page",
     "page-two": "Second Page"
   }
   ```

3. **Add pages** to the directory:
   ```bash
   touch pages/my-new-section/page-one.mdx
   touch pages/my-new-section/page-two.mdx
   ```

4. **Update the root navigation** in `pages/_meta.json`:
   ```json
   {
     "index": "Introduction",
     "quickstart": "Quickstart",
     "my-new-section": "My New Section",
     "concepts": "Game concepts"
   }
   ```

## Navigation System

Nextra uses `_meta.json` files to configure navigation:

- **File-based routing**: Each `.mdx` file becomes a page
- **Navigation order**: Controlled by `_meta.json` files  
- **Nested sections**: Directories with `_meta.json` create navigation groups

### Navigation Configuration Examples

**Simple page list:**
```json
{
  "introduction": "Introduction",
  "getting-started": "Getting Started", 
  "advanced": "Advanced Topics"
}
```

**External links:**
```json
{
  "api_ref": {
    "title": "API Reference ↗",
    "type": "page",
    "href": "https://api.artifactsmmo.com/docs",
    "newWindow": true
  }
}
```

**Hidden pages:**
```json
{
  "index": "Introduction",
  "hidden-page": {
    "display": "hidden"
  }
}
```

## Content Features

### MDX Components

You can use React components in your Markdown:

```mdx
import { Callout } from 'nextra/components'
import { Tabs } from 'nextra/components'
import { Cards, Card } from 'nextra/components'

<Callout type="warning" emoji="⚠️">
Important warning message
</Callout>

<Cards>
  <Card title="API Guide" href="/api_guide/authorization" />
  <Card title="Quickstart" href="/quickstart/introduction" />
</Cards>
```

### Images and Assets

1. **Add images** to the `public/` directory or reference external URLs:
   ```mdx
   ![Alt text](https://example.com/image.png)
   ```

2. **Use Next.js Image component** for optimized loading:
   ```mdx
   import Image from 'next/image'
   
   <Image src="/my-image.png" alt="Description" width={500} height={300} />
   ```

## Theme Configuration

The site appearance is configured in `theme.config.tsx`:

### Key Configuration Options

```tsx
const config: DocsThemeConfig = {
  logo: <span><img src="logo-url" alt="logo" /></span>,
  chat: {
    link: 'https://discord.gg/invite-code',
  },
  docsRepositoryBase: 'https://github.com/user/repo/blob/main/',
  footer: {
    text: '© 2025 Your Company',
  },
  primaryHue: 164,        // Brand color hue
  primarySaturation: 55,  // Brand color saturation
  // ... other options
}
```

### Common Customizations

- **Logo**: Update the `logo` property
- **Colors**: Adjust `primaryHue` and `primarySaturation`
- **Footer**: Modify the `footer.text`
- **Social links**: Update `chat.link` for Discord, add GitHub link
- **Edit links**: Configure `docsRepositoryBase` for "Edit this page" links

## Deployment

This site is typically deployed on platforms like:

- **Vercel** (recommended for Next.js apps)
- **Netlify** 
- **GitHub Pages** (with static export)

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `.next` directory.

## Common Troubleshooting

### Development Issues

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
npm run dev -- -p 3001
```

**Build errors:**
- Check for syntax errors in `.mdx` files
- Ensure all `_meta.json` files have valid JSON
- Verify all imported components exist

**Navigation not updating:**
- Check `_meta.json` syntax
- Restart the development server
- Clear Next.js cache: `rm -rf .next`

### Content Issues

**Images not loading:**
- Verify image paths are correct
- Check if images exist in `public/` directory
- For external images, ensure URLs are accessible

**Components not rendering:**
- Verify import statements
- Check component syntax
- Ensure components are available in Nextra

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-improvement`  
3. **Make your changes** following the guidelines above
4. **Test locally**: `npm run dev` and verify your changes
5. **Build successfully**: `npm run build`
6. **Submit a pull request**

## Additional Resources

- [Nextra Documentation](https://nextra.site)
- [MDX Documentation](https://mdxjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Artifacts API Documentation](https://api.artifactsmmo.com/docs)

## Support

For questions or issues:
- Join our [Discord community](https://discord.gg/prEBQ8a6Vs)
- Create an issue in this repository
- Check existing documentation and examples