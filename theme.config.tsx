import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import { useConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span><img src="https://api.artifactsmmo.com/images/docs/small-logo.png" alt="logo" /></span>,
  chat: {
    link: 'https://discord.gg/prEBQ8a6Vs',
  },
  docsRepositoryBase: 'https://github.com/MuigetsuVB/mmo-docs/blob/main/',
  footer: {
    text: '© 2023 Artifacts. All rights reserved. ',
  },
  nextThemes: {
    defaultTheme: 'dark',
    forcedTheme: 'dark',
    
  }, 
  primaryHue: 164,
  primarySaturation: 74 
}

export default config
