import fetch from 'node-fetch';
import { getBuffer } from '../lib/message.js';

const API_URL = 'https://api-faa.my.id/faa/spotify-play';

export default {
  command: ['spotify', 'spotifyplay', 'sp'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('🎵 *QUEEN NAZUMA MINI:* \n> Please enter the song name or Spotify link to search.\n\n*Example:*\n> .spotify Jayms\n> .spotify https://open.spotify.com/track/xxx')
      }

      const query = args.join(' ')
      await m.reply(`> 🔍 *Searching Spotify for:* "${query}"...`)

      // Extract search term if it's a Spotify URL
      let searchQuery = query
      if (query.includes('open.spotify.com/track/')) {
        const trackId = query.split('/track/')[1]?.split('?')[0]
        if (trackId) searchQuery = trackId
      }

      const response = await fetch(`${API_URL}?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (!data.status || !data.info || !data.download?.url) {
        return m.reply('❌ *QUEEN NAZUMA MINI:* \n> Could not find the song on Spotify.\n> Please try a different search term.')
      }

      const { info, download } = data
      const audioBuffer = await getBuffer(download.url)
      const thumbBuffer = await getBuffer(info.thumbnail)

      const message = `✨ ── QUEEN NAZUMA MINI ── ✨

🎵 *Spotify Downloader*

• 🏷️ *Title:* ${info.title}
• 🎤 *Artist:* ${info.artist}
• 💿 *Album:* ${info.album}
• 📅 *Release:* ${info.release_date}
• ⏱️ *Duration:* ${info.duration}
• 🔗 *Spotify:* ${info.spotify_url}

> 🎶 *Enjoy your music!*`

      // Send thumbnail with info
      await client.sendMessage(m.chat, {
        image: thumbBuffer,
        caption: message,
        contextInfo: {
          externalAdReply: {
            title: info.title,
            body: info.artist,
            thumbnail: thumbBuffer,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })

      // Send the audio
      await client.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: `${info.title}.mp3`
      }, { quoted: m })

    } catch (error) {
      console.error('Spotify command error:', error)
      await m.reply('🥀 *QUEEN NAZUMA MINI:* \n> An error occurred while processing your request.\n> Please try again later.')
    }
  }
}