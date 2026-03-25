const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} second${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minute${minutes !== 1 ? 's' : ''}, ${pad(seconds)} second${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['slut'],
  category: 'rpg',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    const user = chatData.users[m.sender]
    const cooldown = 10 * 60 * 1000
    const now = Date.now()
    const remaining = (user.slutCooldown || 0) - now
    const currency = botSettings.currency || 'Coins'

    if (remaining > 0)
      return m.reply(`You must wait *${msToTime(remaining)}* before trying again.`)

    const success = Math.random() < 0.5
    const amount = Math.floor(Math.random() * 5000)
    user.slutCooldown = now + cooldown

    const winMessages = [
      `They organized a themed party and you earned *¥${amount.toLocaleString()} ${currency}!`,
      `You gave an incredible performance at the club and took home *¥${amount.toLocaleString()} ${currency}!`,
      `Your dancing dazzled everyone and you earned *¥${amount.toLocaleString()} ${currency}!`,
      `You were the center of attention and earned *¥${amount.toLocaleString()} ${currency}!`,
      `Your charisma and charm shone and you earned *¥${amount.toLocaleString()} ${currency}!`,
      `You made an amazing deal with producers and earned *¥${amount.toLocaleString()} ${currency}!`,
    ]

    const loseMessages = [
      `Your energy faded and you didn't shine, losing *¥${amount.toLocaleString()} ${currency}.`,
      `You made a mistake in your performance and lost *¥${amount.toLocaleString()} ${currency}.`,
      `A grumpy customer caused you problems and you lost *¥${amount.toLocaleString()} ${currency}.`,
      `Your outfit wasn't well received and you lost *¥${amount.toLocaleString()} ${currency}.`,
      `The sound failed during your performance and you lost *¥${amount.toLocaleString()} ${currency}.`,
      `A bad day at the club resulted in a loss of *¥${amount.toLocaleString()} ${currency}.`,
    ]

    const message = success
      ? winMessages[Math.floor(Math.random() * winMessages.length)]
      : loseMessages[Math.floor(Math.random() * loseMessages.length)]

    if (success) {
      user.coins = (user.coins || 0) + amount
    } else {
      const total = (user.coins || 0) + (user.bank || 0)
      if (total >= amount) {
        if (user.coins >= amount) {
          user.coins -= amount
        } else {
          const remainingLoss = amount - user.coins
          user.coins = 0
          user.bank -= remainingLoss
        }
      } else {
        user.coins = 0
        user.bank = 0
      }
    }

    await client.sendMessage(
      chatId,
      {
        text: ` ${message}`,
        mentions: [senderId],
      },
      { quoted: m },
    )
  },
};