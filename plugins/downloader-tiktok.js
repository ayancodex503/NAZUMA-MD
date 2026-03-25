import fetch from 'node-fetch';
import { getBuffer } from '../lib/message.js';

const API_URL = 'https://anabot.my.id/api/download/tiktok';
const API_KEY = 'freeApikey';

async function tiktokDownloader(url) {
  try {
    const response = await fetch(`${API_URL}?url=${encodeURIComponent(url)}&apikey=${API_KEY}`, {
      method: 'GET'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default {
  command: ['tiktok', 'tt', 'tkdl'],
  category: 'downloader',
  run: async (client, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('📱 *QUEEN NAZUMA MINI:* \n> Please enter a TikTok video link.\n\n*Example:*\n> .tiktok https://vt.tiktok.com/ZSuWohbT5/')
      }

      const url = args[0]
      
      // Validate TikTok URL
      if (!url.includes('tiktok.com') && !url.includes('vt.tiktok.com')) {
        return m.reply('❌ *QUEEN NAZUMA MINI:* \n> Please enter a valid TikTok link.')
      }

      await m.reply(`> 📥 *Processing TikTok video...*`)

      const result = await tiktokDownloader(url)

      // Check if API returned success
      if (!result.success || !result.data?.result) {
        console.log('API Response:', result)
        return m.reply('❌ *QUEEN NAZUMA MINI:* \n> Could not process the TikTok video.\n> Please check the link and try again.')
      }

      const data = result.data.result
      
      // Extract video URL (prefer no watermark)
      let videoUrl = data.nowatermark || data.video
      
      if (!videoUrl) {
        return m.reply('❌ *QUEEN NAZUMA MINI:* \n> Could not extract video from this TikTok post.')
      }

      const videoBuffer = await getBuffer(videoUrl)
      
      // Prepare info message
      let infoMessage = `✨ ── ƢƲЄЄƝ ƝƛȤƲMƛ MƖƝƖ ── ✨\n\n`
      infoMessage += `📱 *TikTok Downloader*\n\n`
      infoMessage += `• 👤 *Username:* ${data.username || 'Unknown'}\n`
      infoMessage += `• 📝 *Description:* ${(data.description || 'No description').substring(0, 100)}${data.description?.length > 100 ? '...' : ''}\n\n`
      
      if (data.audio) {
        infoMessage += `🎵 *Audio available* (use .tiktokaudio for audio only)\n`
      }
      
      infoMessage += `\n> 🎬 *Enjoy your video!*`

      // Send thumbnail if available
      if (data.thumbnail) {
        const thumbBuffer = await getBuffer(data.thumbnail)
        await client.sendMessage(m.chat, {
          image: thumbBuffer,
          caption: infoMessage,
          contextInfo: {
            externalAdReply: {
              title: 'TikTok Video',
              body: data.username || 'TikTok User',
              thumbnail: thumbBuffer,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: m })
      } else {
        await client.sendMessage(m.chat, { text: infoMessage }, { quoted: m })
      }

      // Send the video
      await client.sendMessage(m.chat, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        caption: data.nowatermark ? '📱 *Video without watermark*' : '📱 *TikTok Video*',
        fileName: `tiktok_${data.username || 'video'}.mp4`
      }, { quoted: m })

    } catch (error) {
      console.error('TikTok command error:', error)
      await m.reply('🥀 *QUEEN NAZUMA MINI:* \n> An error occurred while processing your request.\n> Please try again later.')
    }
  }
}