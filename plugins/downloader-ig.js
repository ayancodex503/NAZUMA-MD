import fetch from 'node-fetch';

export default {
  command: ['instagram', 'ig'],
  category: 'downloader',
  run: async (client, m, args, command) => {

    const url = args[0]

    if (!url) {
      return m.reply('✨ *Usage:* Enter an Instagram link (Reel, Post or IGTV).')
    }

    if (!url.match(/instagram\.com\/(p|reel|share|tv|stories)\//)) {
      return m.reply('❌ The link does not seem valid. Make sure it\'s an Instagram link.')
    }

    try {
      
      await m.reply('> 📥 *Extracting Instagram content...*')

      const res = await fetch(`${api.url}/download/instagram?url=${encodeURIComponent(url)}`)
      const json = await res.json()

      if (!json.status || !json.result || !json.result.dl) {
        return m.reply('❌ Could not get content. The profile might be private or the link expired.')
      }

      const dl = json.result.dl;
      
      let type = 'video';
      if (dl.includes('.jpg') || dl.includes('.png') || dl.includes('.jpeg') || dl.includes('webp')) {
        type = 'image';
      }

      await client.sendMessage(
        m.chat,
        {
          [type]: { url: dl },
          caption: "Here you go 😘"
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      await m.reply('❌ An error occurred while connecting to the Instagram server.')
    }
  }
};