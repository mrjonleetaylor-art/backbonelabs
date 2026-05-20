import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RelayDesk',
    short_name: 'RelayDesk',
    description: 'RelayDesk is an AI phone agent for Australian local businesses.',
    theme_color: '#1E3A5F',
    background_color: '#FAF9F5',
    display: 'standalone',
    start_url: '/',
  }
}
