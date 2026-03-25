import fetch from 'node-fetch';

export default {
  command: ['llama'],
  category: 'ai',

  run: async (client, m, args, command) => {

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isPremiumBot = global.db.data.settings[botId]?.botprem === true
    const isModBot = global.db.data.settings[botId]?.botmod === true

    if (!isOficialBot && !isPremiumBot && !isModBot) {
      return client.reply(m.chat, `🔹 The command *${command}* is not available in *Sub-Bots.*`, m)
    }

    
    let text = args.join(' ').trim()

    
    if (!text && m.quoted) {
      text =
        m.quoted.text ||
        m.quoted.caption ||
        m.quoted.body ||
        ''
    }

    text = text.trim().toLowerCase()

    if (!text) {
      return m.reply(`🔹 Write a *request* or reply to a message for *Llama* to respond.`)
    }

    const apiUrl = `${api.url}/ai/llama?text=${encodeURIComponent(text)}`

    try {
      const { key } = await client.sendMessage(
        m.chat,
        { text: `✎ *Llama* is processing your response...` },
        { quoted: m },
      )

      const res = await fetch(apiUrl)
      const json = await res.json()

      if (!json || !json.result) {
        return client.reply(m.chat, '✐ Could not get a valid *response*', m)
      }

      const response = String(json.result).trim()

      await client.sendMessage(
        m.chat,
        { text: response, edit: key }
      )

    } catch (error) {
      console.error(error)
      await m.reply(msgglobal)
    }
  },
}