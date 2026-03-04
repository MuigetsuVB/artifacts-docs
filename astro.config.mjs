import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { ion } from 'starlight-ion-theme';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
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
          label: '[fe:loop] Changelog',
          link: '/changelog/',
        },
        {
          label: 'Funding',
          link: '/funding/',
        },
        {
          label: 'Roadmap',
          link: '/roadmap/',
        },
        {
          label: 'Quickstart',
          items: [
            { label: 'Introduction', link: '/quickstart/introduction/' },
            { label: 'Your first fight', link: '/quickstart/first_fight/' },
            { label: 'Recover your hit points', link: '/quickstart/hp_recovery/' },
            { label: 'New mission', link: '/quickstart/new_mission/' },
            { label: 'Crafting', link: '/quickstart/crafting/' },
            { label: 'The end', link: '/quickstart/the_end/' },
          ],
        },
        {
          label: 'Game concepts',
          items: [
            { label: 'Achievements', link: '/concepts/achievements/' },
            {
              label: 'Actions',
              items: [
                { label: 'Overview', link: '/concepts/actions/' },
                { label: 'Fight', link: '/concepts/actions/fight/' },
              ],
            },
            { label: 'Events', link: '/concepts/events/' },
            { label: 'Give items & Gold', link: '/concepts/give/' },
            { label: 'Grand Exchange', link: '/concepts/grand_exchange/' },
            { label: 'Inventory and Bank', link: '/concepts/inventory_and_bank/' },
            { label: 'Maps and Movement', link: '/concepts/maps_and_movement/' },
            { label: 'NPCs', link: '/concepts/npcs/' },
            { label: 'Pending Items', link: '/concepts/pending_items/' },
            { label: 'Recycling', link: '/concepts/recycling/' },
            { label: 'Resting and using items', link: '/concepts/resting_and_using_items/' },
            { label: 'Skills', link: '/concepts/skills/' },
            { label: 'Stats and Fights', link: '/concepts/stats_and_fights/' },
            { label: 'Tasks', link: '/concepts/tasks/' },
          ],
        },
        {
          label: 'API Guide',
          items: [
            { label: 'OpenAPI Spec', link: '/api_guide/openapi_spec/' },
            { label: 'Authorization', link: '/api_guide/authorization/' },
            { label: 'Response Codes', link: '/api_guide/response_codes/' },
            { label: 'Rate limits', link: '/api_guide/rate_limits/' },
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
