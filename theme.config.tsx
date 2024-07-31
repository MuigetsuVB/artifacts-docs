import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import { useRouter } from 'next/router'

const config: DocsThemeConfig = {
  logo: <span><img src="/logo.png" alt="logo" /></span>,
  chat: {
    link: 'https://discord.gg/prEBQ8a6Vs',
  },
  useNextSeoProps() {
    const { asPath } = useRouter()
      return {
        titleTemplate: '%s – Artifacts'
      }
    
  },
  docsRepositoryBase: 'https://github.com/MuigetsuVB/mmo-docs/blob/main/',
  footer: {
    text: '© 2024 Artifacts. All rights reserved. ',
  },
  nextThemes: {
    defaultTheme: 'dark',
    forcedTheme: 'dark',
    themes: ['dark']
  }, 
  primaryHue: 164,
  primarySaturation: 55,
  editLink: {
    component: null
  },
  feedback: {
    content: null
  },
  staticImage: true,
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" href="/favicon.png" />
      <meta property="og:title" content="Artifacts - Documentation" />
      <meta property="og:description" content="Artifacts is a API-based MMORPG game. Use any programming language to control your characters with the API." />
    </>
  )

}

export default config