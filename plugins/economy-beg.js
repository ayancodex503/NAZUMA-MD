const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} second${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minute${minutes !== 1 ? 's' : ''}, ${pad(seconds)} second${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['beg'],
  category: 'rpg',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'

    if (!db.settings[botId]) db.settings[botId] = {}
    if (!db.chats[chatId]) db.chats[chatId] = {}
    if (!db.chats[chatId].users) db.chats[chatId].users = {}
    if (!db.chats[chatId].users[senderId]) db.chats[chatId].users[senderId] = { coins: 0, bank: 0 }

    const botSettings = db.settings[botId]
    const chatData = db.chats[chatId]
    const user = chatData.users[senderId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    const cooldown = 5 * 60 * 1000
    const now = Date.now()
    const remaining = (user.begCooldown || 0) - now
    const currency = botSettings.currency || 'Coins'

    if (remaining > 0)
      return m.reply(`You must wait *${msToTime(remaining)}* before trying again.`)

    const success = Math.random() < 0.8
    const amount = Math.floor(Math.random() * 500) + 1

    user.begCooldown = now + cooldown

    const successMessages = [
      `A kind person gave you *¥${amount.toLocaleString()} ${currency}*.`,
      `Someone felt pity and gave you *¥${amount.toLocaleString()} ${currency}*.`,
      `You received help on the street and earned *¥${amount.toLocaleString()} ${currency}*.`,
      `A stranger supported you with *¥${amount.toLocaleString()} ${currency}*.`,
      `Your luck changed and you got *¥${amount.toLocaleString()} ${currency}*.`,
    ]

    const failMessages = [
      `No one paid attention to you this time...`,
      `You tried to ask for money but had no luck.`,
      `People completely ignored you.`,
      `Today wasn't your day to get help.`,
      `You didn't manage to get anything this time.`,
    ]

    let message

    if (success) {
      user.coins += amount
      message = successMessages[Math.floor(Math.random() * successMessages.length)]
    } else {
      message = failMessages[Math.floor(Math.random() * failMessages.length)]
    }

    await client.sendMessage(
      chatId,
      {
        text: message,
        mentions: [senderId],
      },
      { quoted: m }
    )
  },
}