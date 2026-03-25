import fetch from 'node-fetch';

export default {
  command: ['tiktoksearch', 'ttsearch', 'tts'],
  category: 'search',
  run: async (client, m, args) => {
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = global.db.data.settings[botId] || {}
    const botname = botSettings.namebot || 'QUEEN NAZUMA MINI'
    const banner = botSettings.icon

    if (!args || !args.length) {
      return m.reply(`✨ *Usage:* Enter a term to search for TikTok videos.`)
    }

    const query = args.join(' ')
    const url = `${api.url}/search/tiktok?q=${encodeURIComponent(query)}`

    try {
      await m.reply(`> 🔍 *Searching top results for:* "${query}"...`)

      const res = await fetch(url)
      const json = await res.json()

      if (!json.status || !json.result || !json.result.length) {
        return m.reply(`❌ No results found for "${query}".`)
      }

      let message = `╔════════════════════╗\n`
      message += `║   🔎 *TIKTOK EXPLORER* ║\n`
      message += `╚════════════════════╝\n\n`
      
      message += `╔▣ **RESULTS FOR: ${query.toUpperCase()}**\n`
      message += `┃ ◈ *Total:* ${json.result.length} videos\n`
      message += `╚════════════════════\n\n`

      json.result.forEach((result, index) => {
        const isLast = index === json.result.length - 1
        const author = result.author?.nickname || 'Unknown'
        const views = result.play_count?.toLocaleString() || '0'
        
        message += `┏──『 *RESULT #${index + 1}* 』──┓\n`
        message += `┃ ◈ *Title:* ${result.title?.substring(0, 50) || 'No title'}...\n`
        message += `┃ ◈ *Author:* ${author}\n`
        message += `┃ ◈ *Views:* ${views} 👁️\n`
        message += `┃ ◈ *Likes:* ${result.digg_count?.toLocaleString() || 0} ❤️\n`
        message += `┃ ◈ *Duration:* ${result.duration || 'N/A'}\n`
        message += `┃ ◈ *Link:* https://vt.tiktok.com/${result.video_id || result.id}\n`
        message += `┗━━━━━━━━━━━━━━━━━━━━┛\n`
        
        if (!isLast) message += `\n`
      })

      message += `\n> 💡 *Tip:* Use the *playvideo* command with the link to download.`

      await client.sendMessage(
        m.chat,
        {
          image: { url: banner },
          caption: message.trim(),
        },
        { quoted: m },
      )
    } catch (e) {
      console.error(e)
      await m.reply('❌ Critical failure in TikTok search engine.')
    }
  },
};