export default {
  command: ['ritual'],
  category: 'rpg',
  run: async (client, m) => {
    const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = global.db.data.settings[botId]
    const currency = botSettings?.currency || 'Coins'

    const chat = global.db.data.chats[m.chat]
    if (chat.adminonly || !chat.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    const user = chat.users[m.sender]
    const remaining = user.ritualCooldown - Date.now()
    if (remaining > 0) {
      return m.reply(`You must wait *${msToTime(remaining)}* to perform another ritual.`)
    }

    user.ritualCooldown = Date.now() + 15 * 60000

    const roll = Math.random()
    let reward = 0
    let narration = ''
    let bonusMsg = ''

    if (roll < 0.05) {
      reward = Math.floor(Math.random() * 100000) + 50000
      narration = 'You have summoned an ancestral spirit that grants you a cosmic treasure!'
      bonusMsg = '\nMYTHIC reward obtained!'
    } else if (roll < 0.25) {
      reward = Math.floor(Math.random() * 10000) + 2000
      narration = 'Your ritual opens a portal and burning riches fall from the void'
    } else if (roll < 0.75) {
      reward = Math.floor(Math.random() * 5000) + 500
      narration = `Under the moon, your ritual grants you *${reward.toLocaleString()} ${currency}*`
    } else {
      const loss = Math.floor(Math.random() * 2000) + 500
      user.coins = Math.max(0, user.coins - loss)
      return m.reply(`The ritual went wrong... a curse took *${loss.toLocaleString()} ${currency}* from you`)
    }

    if (Math.random() < 0.15) {
      const bonus = Math.floor(Math.random() * 4000) + 1000
      reward += bonus
      bonusMsg += `\nExtra energy! You earned *${bonus.toLocaleString()}* ${currency} additional`
    }

    user.coins += reward

    let msg = ` ${narration}\nYou earned *${reward.toLocaleString()} ${currency}*`
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