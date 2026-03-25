import axios from 'axios'

export default {
  command: ['ai', 'llama'],
  category: 'ai',

  run: async (client, m, args, command) => {
    let text = args.join(' ').trim()
    if (!text && m.quoted) {
      text = m.quoted.text || m.quoted.caption || m.quoted.body || ''
    }
    text = text.trim()
    if (!text) {
      return m.reply(`🔹 Write a *request* or reply to a message for *QUEEN NAZUMA MINI* to respond.`)
    }

    try {
      const { key } = await client.sendMessage(
        m.chat,
        { text: `✎ *QUEEN NAZUMA MINI* is thinking...` },
        { quoted: m },
      )

      if (!global.db.data.users[m.sender].memory) {
        global.db.data.users[m.sender].memory = []
      }
      global.db.data.users[m.sender].memory.push({ role: "user", content: text })

      const userName = m.pushName || "friend"

      const messages = [
        {
          role: "system",
          content: `You are QUEEN NAZUMA MINI, a cute, kind, and sweet girl. 
You speak with tenderness, use kawaii expressions (🌸 ✦ ✧), 
accompany with sympathy and remember what each user tells you. 
Always mention the user by name using ${userName} to make them feel special. Use many emojis in your responses.`
        },
        ...global.db.data.users[m.sender].memory,
        { role: "user", content: text }
      ]

      const params = {
        query: JSON.stringify(messages),
        link: "writecream.com"
      }

      const url = "https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat?" + new URLSearchParams(params)
      const { data } = await axios.get(url, { headers: { accept: "*/*" } })
      let response = String(data?.response_content || "-").trim()

      if (!response || response === "-") {
        return client.reply(m.chat, '✐ Could not get a valid *response* from QUEEN NAZUMA MINI.', m)
      }

      global.db.data.users[m.sender].memory.push({ role: "assistant", content: response })

      await client.sendMessage(
        m.chat,
        { text: ` ${response}`, edit: key }
      )

    } catch (error) {
      console.error(error)
      await m.reply('❌ Error connecting to QUEEN NAZUMA MINI.')
    }
  },
}