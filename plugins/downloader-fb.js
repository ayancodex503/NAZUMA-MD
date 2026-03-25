import axios from 'axios'

export default {
  command: ['fb'],
  category: 'downloader',
  run: async (client, m, args, command) => {

    if (!args[0]) {
      return m.reply('✨ *Usage:* Enter a Facebook link to download the video.')
    }

    if (!args[0].match(/facebook\.com|fb\.watch|video\.fb\.com/)) {
      return m.reply('❌ Please send a valid Facebook link.')
    }

    try {
    
      await m.reply('> 📥 *Extracting Facebook video, please wait...*')

      const res = await axios.get(`${api.url2}/api/v1/download/facebook`, {
        params: {
          url: args[0]
        }
      })

      const json = res.data

      if (!json.status || !json.result || !json.result.download) {
        return m.reply('❌ Could not get video from server.')
      }

      const downloads = json.result.download
     
      let videoUrl
      let quality
      
      if (downloads.hd) {
        videoUrl = downloads.hd
        quality = 'HD'
      } else if (downloads.sd) {
        videoUrl = downloads.sd
        quality = 'SD'
      } else {
        return m.reply('❌ No download links available.')
      }

      const infoMessage = 'Here you go 😘'

      await client.sendMessage(
        m.chat,
        { 
          video: { url: videoUrl }, 
          caption: infoMessage, 
          mimetype: 'video/mp4', 
          fileName: `fb_video_${quality.toLowerCase()}.mp4`
        },
        { quoted: m }
      )

    } catch (e) {
      console.error('Error downloading Facebook:', e)
      await m.reply('❌ Critical error downloading from Facebook. Check the link or try again later.')
    }
  }
}