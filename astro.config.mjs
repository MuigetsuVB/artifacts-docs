import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { ion } from 'starlight-ion-theme';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  vite: {
    preview: {
      allowedHosts: true,
    },
  },
  trailingSlash: 'always',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'tap',
  },
  build: {
    format: 'directory',
  },
  integrations: [
    starlight({
      plugins: [
        ion({
          icons: {},
          footer: {
            text: '© Artifacts 2026',
          },
        }),
      ],
      components: {
        Header: './src/components/site/Header.astro',
        Search: './src/components/site/Search.astro',
        Pagination: './src/components/ion/Pagination.astro',
      },
      title: 'Artifacts',
      favicon: '/src/assets/images/favicon.png',
      logo: {
        dark: './src/styles/logo.png',
        light: './src/styles/logo.png',
        alt: 'Artifacts logo',
        replacesTitle: true,
      },
      social: [
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/prEBQ8a6Vs' },
        { icon: 'github', label: 'GitHub', href: 'https://github.com/MuigetsuVB/artifacts-docs' },
      ],
      lastUpdated: true,
      customCss: [
        './src/styles/custom.css',
      ],
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: '/fonts/inter-latin-400-normal.woff2',
            as: 'font',
            type: 'font/woff2',
            crossorigin: 'anonymous',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: '/fonts/inter-latin-500-normal.woff2',
            as: 'font',
            type: 'font/woff2',
            crossorigin: 'anonymous',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: '/fonts/inter-latin-600-normal.woff2',
            as: 'font',
            type: 'font/woff2',
            crossorigin: 'anonymous',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: '/fonts/inter-latin-700-normal.woff2',
            as: 'font',
            type: 'font/woff2',
            crossorigin: 'anonymous',
          },
        },
        {
          tag: 'script',
          content:
            "try { localStorage.setItem('starlight-theme', 'dark'); } catch {} document.documentElement.dataset.theme = 'dark';",
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:title',
            content: 'Artifacts - Documentation',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:description',
            content: 'Artifacts is a API-based MMORPG. Use any programming language to control your characters with the API.',
          },
        },
      ],
      sidebar: [
        {
          label: '[lucide:house] Home',
          link: '/',
        },
        {
          label: '[lucide:list] Getting Started',
          link: '/getting-started/',
        },
        {
          label: '[fe:loop] Changelog',
          link: '/changelog/',
        },
        {
          label: '[lucide:external-link] API Reference',
          link: 'https://api.artifactsmmo.com/docs',
          attrs: { target: '_blank', rel: 'noopener' },
        },
        {
          label: '[lucide:heart] Funding',
          link: '/funding/',
        },
        {
          label: '[lucide:swords] Game Concepts',
          items: [
            { label: 'Seasons', link: '/concepts/seasons/' },
            { label: 'Achievements', link: '/concepts/achievements/' },
            { label: 'Actions & Cooldowns', link: '/concepts/actions/' },
            { label: 'Maps & Movement', link: '/concepts/maps_and_movement/' },
            { label: 'Combat & Stats', link: '/concepts/stats_and_fights/' },
            { label: 'Equipment', link: '/concepts/equipment' },
            { label: 'Skills', link: '/concepts/skills/' },
            { label: 'Recycling', link: '/concepts/recycling/' },
            { label: 'Resting & Using items', link: '/concepts/resting_and_using_items/' },
            { label: 'Give Items & Gold', link: '/concepts/give/' },
            { label: 'Pending Items', link: '/concepts/pending_items/' },
            { label: 'Inventory & Bank', link: '/concepts/inventory_and_bank/' },
            { label: 'Grand Exchange', link: '/concepts/grand_exchange/' },
            { label: 'NPCs', link: '/concepts/npcs/' },
            { label: 'Tasks', link: '/concepts/tasks/' },
            { label: 'Events', link: '/concepts/events/' },

          ],
        },
        {
          label: '[lucide:code-2] API Guide',
          items: [
            { label: 'Authentication', link: '/api_guide/authorization/' },
            { label: 'Response Codes & Errors', link: '/api_guide/response_codes/' },
            { label: 'Rate Limits & Cooldowns', link: '/api_guide/rate_limits/' },
            { label: 'OpenAPI Specification', link: '/api_guide/openapi_spec/' },
          ],
        },
        {
          label: '[lucide:crown] Members',
          items: [
            { label: 'Event Tokens', link: '/members/event-tokens/' },
            { label: 'Fight Simulator', link: '/members/fight-simulator/' },
            { label: 'Sandbox Server', link: '/members/sandbox-server/' },
            { label: 'Test Server', link: '/members/test-server/' },
            { label: 'WebSockets', link: '/members/websockets/' },

          ],
        },
        {
          label: '[lucide:image] Resources',
          items: [
            { label: 'Images & Assets', link: '/resources/images/' },
          ],
        },
      ],
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
      },
    }),
  ],
});