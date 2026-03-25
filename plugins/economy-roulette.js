const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} second${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minute${minutes !== 1 ? 's' : ''}, ${pad(seconds)} second${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['rt', 'roulette'],
  category: 'rpg',
  run: async (client, m, args) => {
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
    const remaining = (user.rtCooldown || 0) - now
    const currency = botSettings.currency || 'Coins'

    if (remaining > 0)
      return m.reply(`You must wait *${msToTime(remaining)}* before betting again.`)

    if (args.length !== 2)
      return m.reply(
        `You must enter an amount of ${currency} and bet on a color.`,
      )

    const amount = parseInt(args[0])
    const color = args[1].toLowerCase()
    const validColors = ['red', 'black', 'green']

    if (isNaN(amount) || amount < 200)
      return m.reply(`The minimum amount of ${currency} to bet is 200.`)

    if (!validColors.includes(color))
      return m.reply(`Please choose a valid color: red, black, green.`)

    if (user.coins < amount)
      return m.reply(`You don't have enough *${currency}* to make this bet.`)

    user.rtCooldown = now + cooldown
    const resultColor = validColors[Math.floor(Math.random() * validColors.length)]

    if (resultColor === color) {
      const reward = amount * (resultColor === 'green' ? 14 : 2)
      user.coins += reward
      await client.sendMessage(
        chatId,
        {
          text: `The roulette landed on *${resultColor}* and you won *¥${reward.toLocaleString()} ${currency}*.`,
          mentions: [senderId],
        },
        { quoted: m },
      )
    } else {
      user.coins -= amount
      await client.sendMessage(
        chatId,
        {
          text: `The roulette landed on *${resultColor}* and you lost *¥${amount.toLocaleString()} ${currency}*.`,
          mentions: [senderId],
        },
        { quoted: m },
      )
    }
  },
};