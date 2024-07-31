import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import { useRouter } from 'next/router'

const config: DocsThemeConfig = {
  logo: <span><img src="https://api.artifactsmmo.com/images/docs/small-logo.png" alt="logo" /></span>,
  chat: {
    link: 'https://discord.gg/prEBQ8a6Vs',
  },
  useNextSeoProps() {
    const { asPath } = useRouter()
      return {
        titleTemplate: '%s – Artifacts'
      }
    
  },
  head: (
    <>
      <meta property="og:title" content="Artifacts MMO" />
      <meta property="og:description" content="Artifacts is a API-based MMORPG game. Use any programming language to control your characters with the API." />
    </>
  )
  ,
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
  }


}

export default config