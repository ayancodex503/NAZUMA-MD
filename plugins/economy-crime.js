export default {
  command: ['crime'],
  category: 'rpg',
  run: async (client, m) => {
    const chat = global.db.data.chats[m.chat]
    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const currency = global.db.data.settings[botId].currency

    if (chat.adminonly || !chat.rpg)
      return m.reply(`✐ These commands are disabled in this group.`)

    if (!user.crimeCooldown) user.crimeCooldown = 0
    const remainingTime = user.crimeCooldown - Date.now()

    if (remainingTime > 0) {
      return m.reply(`You must wait *${msToTime(remainingTime)}* before trying again.`)
    }

    const success = Math.random() < 0.5
    const amount = Math.floor(Math.random() * 5000)
    user.crimeCooldown = Date.now() + 10 * 60 * 1000

    const successMessages = [
      `You pulled off a spectacular bank heist and earned *¥${amount.toLocaleString()} ${currency}!`,
      `You hacked a security system and accessed *¥${amount.toLocaleString()} ${currency}!`,
      `You stole jewelry from an exhibition and got *¥${amount.toLocaleString()} ${currency}!`,
      `You sold confidential information and earned *¥${amount.toLocaleString()} ${currency}!`,
      `You executed a master plan and earned *¥${amount.toLocaleString()} ${currency}!`,
      `You became the king of smuggling and earned *¥${amount.toLocaleString()} ${currency}!`,
    ]

    const failMessages = [
      `You tried to escape after a robbery, but got caught and lost *¥${amount.toLocaleString()} ${currency}.`,
      `You hacked a system and failed, losing *¥${amount.toLocaleString()} ${currency}.`,
      `You made a mistake with your disguise and were recognized, losing *¥${amount.toLocaleString()} ${currency}.`,
      `You tried to extort a client, but they reported you and you lost *¥${amount.toLocaleString()} ${currency}.`,
      `Your plan was betrayed and the police caught you, losing *¥${amount.toLocaleString()} ${currency}.`,
    ]

    const message = success ? pickRandom(successMessages) : pickRandom(failMessages)

    if (success) {
      user.coins += amount
    } else {
      const total = user.coins + user.bank
      if (total >= amount) {
        if (user.coins >= amount) {
          user.coins -= amount
        } else {
          const remaining = amount - user.coins
          user.coins = 0
          user.bank -= remaining
        }
      } else {
        user.coins = 0
        user.bank = 0
      }
    }

    await client.sendMessage(m.chat, { text: ` ${message}` }, { quoted: m })
  },
};

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const min = minutes < 10 ? '0' + minutes : minutes
  const sec = seconds < 10 ? '0' + seconds : seconds

  return min === '00'
    ? `${sec} second${sec > 1 ? 's' : ''}`
    : `${min} minute${min > 1 ? 's' : ''}, ${sec} second${sec > 1 ? 's' : ''}`
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}