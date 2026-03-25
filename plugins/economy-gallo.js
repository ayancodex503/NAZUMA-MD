const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} second${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minute${minutes !== 1 ? 's' : ''}, ${pad(seconds)} second${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['roosterfight', 'betrooster', 'rooster'],
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

    const cooldown = 3 * 60 * 1000
    const now = Date.now()
    const remaining = (user.gallosCooldown || 0) - now
    const currency = botSettings.currency || 'Coins'

    if (remaining > 0)
      return m.reply(`You must wait *${msToTime(remaining)}* to bet again.`)

    const text = m.text || ''
    const args = text.trim().split(/\s+/).slice(1)

    const bet = parseInt(args[0])

    if (!bet || isNaN(bet) || bet <= 0)
      return m.reply(`Enter a valid amount.\nExample: *.rooster 500*`)

    if (user.coins < bet)
      return m.reply(`You don't have enough ${currency}.`)

    const roosterA = ['Red Fury', 'Mortal Lightning', 'Shadow', 'Destroyer', 'The Devil']
    const roosterB = ['Thunder', 'Fang', 'Lightning', 'Titan', 'Beast']

    const a = roosterA[Math.floor(Math.random() * roosterA.length)]
    const b = roosterB[Math.floor(Math.random() * roosterB.length)]

    const win = Math.random() < 0.5

    user.gallosCooldown = now + cooldown

    let message = `🐓 *Rooster Fight*\n\n`
    message += `🔴 ${a} vs 🔵 ${b}\n\n`

    if (win) {
      const reward = Math.floor(bet * (1 + Math.random()))
      user.coins += reward
      message += `🏆 Your rooster won!\nYou earned *¥${reward.toLocaleString()} ${currency}*`
    } else {
      user.coins -= bet
      message += `💀 Your rooster lost...\nYou lost *¥${bet.toLocaleString()} ${currency}*`
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