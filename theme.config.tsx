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
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – Artifacts'
      }
    }
  },
    docsRepositoryBase: 'https://github.com/MuigetsuVB/mmo-docs/blob/main/',
  footer: {
    text: '© 2023 Artifacts. All rights reserved. ',
  },
  nextThemes: {
    defaultTheme: 'dark',
    forcedTheme: 'dark',
    themes: ['dark']
  }, 
  primaryHue: 164,
  primarySaturation: 74,

}

export default config

import { useRouter } from 'next/router'
export default {
  useNextSeoProps() {
    const { asPath } = useRouter()
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – SWR'
      }
    }
  }
}