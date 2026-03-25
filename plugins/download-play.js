import yts from 'yt-search';
import fetch from 'node-fetch';
import { getBuffer } from '../lib/message.js';

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

// API configuration
const API_URL = 'https://anabot.my.id/api/download/playmusic';
const API_KEY = 'freeApikey';

async function playMusicYoutube(query) {
  try {
    const response = await fetch(`${API_URL}?query=${encodeURIComponent(query)}&apikey=${API_KEY}`, {
      method: 'GET'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('🌸 *QUEEN NAZUMA MINI:* \n> Please give me the title or link of the song you want to listen to.')
      }

      const query = args.join(' ')
      let title, thumbBuffer, videoData, duration, channel, views

      // Search for the video if it's not a direct URL
      if (!isYTUrl(query)) {
        const search = await yts(query)
        if (!search.all.length) return m.reply('🥀 *Sorry,* \n> I couldn\'t find results for that search.')
        videoData = search.all[0]
        title = videoData.title
        duration = videoData.timestamp || 'N/A'
        channel = videoData.author?.name || 'YouTube'
        views = (videoData.views || 0).toLocaleString()
        thumbBuffer = await getBuffer(videoData.image || videoData.thumbnail)
      } else {
        // Extract video ID from URL
        const videoId = query.split('v=')[1] || query.split('/').pop()
        const search = await yts({ videoId })
        videoData = search
        title = videoData.title
        duration = videoData.timestamp || 'N/A'
        channel = videoData.author?.name || 'YouTube'
        views = (videoData.views || 0).toLocaleString()
        thumbBuffer = await getBuffer(videoData.image || videoData.thumbnail)
      }

      // Try to use the new API
      const result = await playMusicYoutube(query)

      // Check structure according to the API: { success: true, data: { result: { urls, metadata } } }
      if (result.success && result.data && result.data.result && result.data.result.urls) {
        
        const audioUrl = result.data.result.urls
        const audioBuffer = await getBuffer(audioUrl)
        
        // Get metadata from API
        const metadata = result.data.result.metadata || {}
        const finalTitle = metadata.title || title
        const finalChannel = metadata.channel || channel
        const finalDuration = metadata.duration ? `${Math.floor(metadata.duration / 60)}:${(metadata.duration % 60).toString().padStart(2, '0')}` : duration
        const finalViews = metadata.view_count?.toLocaleString() || views
        const finalLikes = metadata.like_count?.toLocaleString() || 'N/A'

        const infoMessage = `✨ ── QUEEN NAZUMA MINI ── ✨\n\n`
          + `🎵 *Audio ready!*\n\n`
          + `• 🏷️ *Title:* ${finalTitle}\n`
          + `• 🎙️ *Channel:* ${finalChannel}\n`
          + `• ⏳ *Duration:* ${finalDuration}\n`
          + `• 👀 *Views:* ${finalViews}\n`
          + `• ❤️ *Likes:* ${finalLikes}\n\n`
          + `> 🎶 *Enjoy your music!*`

        await client.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m })

        await client.sendMessage(m.chat, {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          ptt: false,
          fileName: `${finalTitle}.mp3`
        }, { quoted: m });
        
        return
      }

      // Fallback to the old API if new API fails
      console.log('New API failed, using fallback...')
      
      const fallbackRes = await fetch(`${api.url}/download/y?url=${encodeURIComponent(videoData.url)}`)
      const fallbackResult = await fallbackRes.json()

      if (!fallbackResult.status || !fallbackResult.result || !fallbackResult.result.url) {
        return m.reply('🥀 *Oops,* \n> There was a small technical issue extracting the audio.\n> Please try again later or use a different search term.')
      }

      const audioUrl = fallbackResult.result.url
      const audioBuffer = await getBuffer(audioUrl)

      const infoMessage = `✨ ── QUEEN NAZUMA MINI ── ✨\n\n`
        + `🎵 *Audio prepared with care*\n\n`
        + `• 🏷️ *Title:* ${title}\n`
        + `• 🎙️ *Channel:* ${channel}\n`
        + `• ⏳ *Duration:* ${duration}\n`
        + `• 👀 *Views:* ${views}\n\n`
        + `> 🎶 *Enjoy your music!*`

      await client.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m })

      await client.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: `${title}.mp3`
      }, { quoted: m });

    } catch (e) {
      console.error('Play command error:', e)
      await m.reply('🥀 *QUEEN NAZUMA MINI:* \n> An unexpected error occurred while processing your request.\n> Please try again later.')
    }
  }
};