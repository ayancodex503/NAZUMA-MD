export default {
  command: ['monthly'],
  category: 'rpg',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const currency = botSettings.currency
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    const user = chatData.users[m.sender]
    const coins = pickRandom([500, 1000, 1500, 2000, 2500])
    const exp = Math.floor(Math.random() * 5000)

    const monthlyCooldown = 30 * 24 * 60 * 60 * 1000 // 30 days
    const lastMonthly = user.lastMonthly || 0
    const timeRemaining = msToTime(monthlyCooldown - (Date.now() - lastMonthly))

    if (Date.now() - lastMonthly < monthlyCooldown)
      return m.reply(
        `✎ You must wait ${timeRemaining} to claim your monthly reward again.`,
      )

    user.lastMonthly = Date.now()
    user.exp += exp
    user.coins += coins

    const info = `☆ ໌　۟　𝖱𝖾𝗐𝖺𝗋𝖽　ׅ　팅화　ׄ

> ✿ *Exp ›* ${exp}
> ⛁ *${currency} ›* ${coins}

${dev}`

    await client.sendMessage(
      chatId,
      {
        text: info,
        mentions: [],
      },
      { quoted: m },
    )
  },
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function msToTime(duration) {
  let milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
    days = Math.floor(duration / (1000 * 60 * 60 * 24))

  days = days < 10 ? '0' + days : days
  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  return `${days} d ${hours} h ${minutes} m and ${seconds} s`
}