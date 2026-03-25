export default {
  command: ['mine'],
  category: 'rpg',
  run: async (client, m) => {
    const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = global.db.data.settings[botId]
    const currency = botSettings?.currency || 'Coins'

    const chat = global.db.data.chats[m.chat]

    if (chat.adminonly || !chat.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    const user = chat.users[m.sender]

    const remaining = user.mineCooldown - Date.now()
    if (remaining > 0) {
      return m.reply(`You must wait *${msToTime(remaining)}* to mine again.`)
    }

    user.mineCooldown = Date.now() + 10 * 60000

    let isLegendary = Math.random() < 0.02
    let reward,
      narration,
      bonusMsg = ''

    if (isLegendary) {
      reward = Math.floor(Math.random() * 50000) + 50000
      narration = 'YOU DISCOVERED A LEGENDARY TREASURE!\n\n'
      bonusMsg = '\n EPIC reward obtained!'
    } else {
      reward = Math.floor(Math.random() * 5000) + 500
      const scenario = pickRandom(scenarios)
      narration = `In ${scenario}, ${pickRandom(mining)}`

      if (Math.random() < 0.1) {
        const bonus = Math.floor(Math.random() * 3000) + 500
        reward += bonus
        bonusMsg = `\n「🖤」 Adventure bonus! You earned *${bonus.toLocaleString()}* ${currency} extra`
      }
    }

    user.coins += reward

    let msg = `🖤 ${narration} *${reward.toLocaleString()} ${currency}*`
    if (bonusMsg) msg += `\n${bonusMsg}`

    await client.reply(m.chat, msg, m)
  },
};

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  if (minutes === '00') return `${seconds} second${seconds > 1 ? 's' : ''}`
  return `${minutes} minute${minutes > 1 ? 's' : ''}, ${seconds} second${seconds > 1 ? 's' : ''}`
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

const scenarios = [
  'a dark and damp cave',
  'the top of a snowy mountain',
  'a mysterious forest full of roots',
  'a clear and flowing river',
  'an abandoned coal mine',
  'the ruins of an ancient castle',
  'a deserted beach with golden sand',
  'a hidden valley between hills',
  'a thorny bush at the roadside',
  'a hollow tree trunk in the middle of the forest',
]

const mining = [
  'you found an ancient chest with',
  'you found a bag full of',
  'you discovered a sack of',
  'you unearthed ancient coins containing',
  'you broke a rock and inside was',
  'digging deep, you found',
  'among the roots, you found',
  'inside a forgotten box, you found',
  'under some stones, you discovered',
  'among the rubble of an old place, you found',
]