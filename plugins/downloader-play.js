import yts from 'yt-search';
import fetch from 'node-fetch';
import { getBuffer } from '../lib/message.js';
import sharp from 'sharp';

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

export default {
  command: ['play', 'song'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('🌸 *QUEEN NAZUMA MINI:* \n> Please give me the title or link of the song you want to listen to.')
      }

      const query = args.join(' ')
      let url, title, thumbBuffer, videoData

      if (!isYTUrl(query)) {
        const search = await yts(query)
        if (!search.all.length) return m.reply('🥀 *Sorry,* \n> I couldn\'t find results for that search.')
        videoData = search.all[0]
        url = videoData.url
      } else {
        const videoId = query.split('v=')[1] || query.split('/').pop()
        const search = await yts({ videoId })
        videoData = search
        url = query
      }

      title = videoData.title
      thumbBuffer = await getBuffer(videoData.image || videoData.thumbnail)

      const views = (videoData.views || 0).toLocaleString()
      const channel = videoData.author?.name || 'YouTube'

      let infoMessage = `✨ ── QUEEN NAZUMA MINI ── ✨\n\n`
      infoMessage += `🎵 *Audio prepared with care*\n\n`
      infoMessage += `• 🏷️ *Title:* ${title}\n`
      infoMessage += `• 🎙️ *Channel:* ${channel}\n`
      infoMessage += `• ⏳ *Duration:* ${videoData.timestamp || 'N/A'}\n`
      infoMessage += `• 👀 *Views:* ${views}\n\n`
      infoMessage += `> 💎 *Sending your music, please wait...*`

      await client.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m })

      const res = await fetch(`${api.url}/download/y?url=${encodeURIComponent(url)}`)
      const result = await res.json()

      if (!result.status || !result.result || !result.result.url) {
        return m.reply('🥀 *Oops,* \n> There was a small technical issue extracting the audio.')
      }

      const { url: audioUrl } = result.result
      const audioBuffer = await getBuffer(audioUrl)

      await client.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: `${title}.mp3`
      }, { quoted: m });

    } catch (e) {
      console.error(e)
      await m.reply('🥀 *QUEEN NAZUMA MINI:* \n> An unexpected error occurred while processing your request.')
    }
  }
};