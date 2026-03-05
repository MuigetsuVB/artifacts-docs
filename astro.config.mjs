import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { ion } from 'starlight-ion-theme';

// https://astro.build/config
export default defineConfig({
  output: 'static',
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
        Pagination: './src/components/ion/Pagination.astro',
      },
      title: 'Artifacts',
      logo: {
        dark: './src/styles/logo.png',
        light: './src/styles/logo.png',
        alt: 'Artifacts game logo',
        replacesTitle: true,
      },
      social: [
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/prEBQ8a6Vs' },
        { icon: 'github', label: 'GitHub', href: 'https://github.com/MuigetsuVB/artifacts-docs' },
      ],
      editLink: {
        baseUrl: 'https://github.com/MuigetsuVB/artifacts-docs/edit/main/',
      },
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
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: 'https://api.artifactsmmo.com/docs/favicon.png',
          },
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
          label: 'Game Concepts',
          items: [
            { label: 'Characters & Account', link: '/concepts/characters_and_account/' },
            { label: 'Maps & Movement', link: '/concepts/maps_and_movement/' },
            { label: 'Skills', link: '/concepts/skills/' },
            { label: 'Combat & Stats', link: '/concepts/stats_and_fights/' },
            { label: 'Equipment & Items', link: '/concepts/equipment_and_items/' },
            { label: 'Inventory & Bank', link: '/concepts/inventory_and_bank/' },
            { label: 'Grand Exchange', link: '/concepts/grand_exchange/' },
            { label: 'NPCs & Trading', link: '/concepts/npcs/' },
            { label: 'Tasks', link: '/concepts/tasks/' },
            { label: 'Achievements', link: '/concepts/achievements/' },
            { label: 'Events', link: '/concepts/events/' },
            { label: 'Recycling', link: '/concepts/recycling/' },
            { label: 'Give Items & Gold', link: '/concepts/give/' },
            { label: 'Pending Items', link: '/concepts/pending_items/' },
            { label: 'Resting & Consumables', link: '/concepts/resting_and_using_items/' },
            { label: 'Actions & Cooldowns', link: '/concepts/actions/' },
          ],
        },
        {
          label: 'API Guide',
          items: [
            { label: 'API Overview', link: '/api_guide/api_overview/' },
            { label: 'Pagination', link: '/api_guide/pagination/' },
            { label: 'OpenAPI Spec', link: '/api_guide/openapi_spec/' },
            { label: 'Authorization', link: '/api_guide/authorization/' },
            { label: 'Response Codes', link: '/api_guide/response_codes/' },
            { label: 'Rate Limits', link: '/api_guide/rate_limits/' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'Overview', link: '/api_guide/api_reference/' },
            { label: 'Server details', link: '/api_guide/api_reference/server-details/' },
            { label: 'Token', link: '/api_guide/api_reference/token/' },
            { label: 'Accounts', link: '/api_guide/api_reference/accounts/' },
            { label: 'Characters', link: '/api_guide/api_reference/characters/' },
            { label: 'My account', link: '/api_guide/api_reference/my-account/' },
            { label: 'My characters', link: '/api_guide/api_reference/my-characters/' },
            { label: 'Items', link: '/api_guide/api_reference/items/' },
            { label: 'Monsters', link: '/api_guide/api_reference/monsters/' },
            { label: 'Maps', link: '/api_guide/api_reference/maps/' },
            { label: 'Resources', link: '/api_guide/api_reference/resources/' },
            { label: 'NPCs', link: '/api_guide/api_reference/npcs/' },
            { label: 'Events', link: '/api_guide/api_reference/events/' },
            { label: 'Achievements', link: '/api_guide/api_reference/achievements/' },
            { label: 'Badges', link: '/api_guide/api_reference/badges/' },
            { label: 'Effects', link: '/api_guide/api_reference/effects/' },
            { label: 'Tasks', link: '/api_guide/api_reference/tasks/' },
            { label: 'Grand Exchange', link: '/api_guide/api_reference/grand-exchange/' },
            { label: 'Leaderboard', link: '/api_guide/api_reference/leaderboard/' },
            { label: 'Simulation', link: '/api_guide/api_reference/simulation/' },
          ],
        },
        {
          label: '[lucide:code-2] SDKs',
          items: [
            {
              label: 'Python',
              items: [
                { label: 'Python SDK', link: '/sdks/python/' },
                { label: 'Installation', link: '/sdks/python/introduction/' },
                { label: 'Character Actions', link: '/sdks/python/character-actions/' },
                { label: 'Game Data', link: '/sdks/python/game-data/' },
                { label: 'Cooldowns & Retry', link: '/sdks/python/cooldowns-and-retry/' },
                { label: 'Error Handling', link: '/sdks/python/error-handling/' },
                { label: 'Multiple Characters', link: '/sdks/python/multiple-characters/' },
                { label: 'Full API Reference', link: '/sdks/python/api-reference/' },
              ],
            },
          ],
        },
        {
          label: 'Resources',
          items: [
            { label: 'Images', link: '/resources/images/' },
          ],
        },
        {
          label: 'Members',
          items: [
            { label: 'Event Tokens', link: '/members/event_tokens/' },
            { label: 'Fight Simulator', link: '/members/fight_simulator/' },
            { label: 'Sandbox Server', link: '/members/sandbox_server/' },
            { label: 'Test Server', link: '/members/test_server/' },
            { label: 'WebSockets', link: '/members/websockets/' },
          ],
        },
        {
          label: '[fe:loop] Changelog',
          link: '/changelog/',
        },
        {
          label: '[lucide:map] Roadmap',
          link: '/roadmap/',
        },
        {
          label: '[lucide:heart] Funding',
          link: '/funding/',
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
