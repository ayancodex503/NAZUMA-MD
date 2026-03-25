export default {
  command: ['waittimes', 'cooldowns', 'economyinfo', 'einfo'],
  category: 'rpg',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    const user = chatData.users[m.sender]
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    const cooldowns = {
      crime: Math.max(0, (user.crimeCooldown || 0) - now),
      mine: Math.max(0, (user.mineCooldown || 0) - now),
      ritual: Math.max(0, (user.ritualCooldown || 0) - now),
      work: Math.max(0, (user.workCooldown || 0) - now),
      rt: Math.max(0, (user.rtCooldown || 0) - now),
      slut: Math.max(0, (user.slutCooldown || 0) - now),
      steal: Math.max(0, (user.stealCooldown || 0) - now),
      rps: Math.max(0, (user.rpsCooldown || 0) - now),
      daily: Math.max(0, (user.lastDaily || 0) + oneDay - now),
      weekly: Math.max(0, (user.lastWeekly || 0) + 7 * oneDay - now),
      monthly: Math.max(0, (user.lastMonthly || 0) + 30 * oneDay - now)
    }

    const formatTime = (ms) => {
      const totalSeconds = Math.floor(ms / 1000)
      const days = Math.floor(totalSeconds / 86400)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      const parts = []
      if (days > 0) parts.push(`${days} d`)
      if (hours > 0) parts.push(`${hours} h`)
      if (minutes > 0) parts.push(`${minutes} m`)
      if (seconds > 0) parts.push(`${seconds} s`)
      return parts.length ? parts.join(', ') : 'Now.'
    }

    const coins = user.coins || 0
    const name = db.users[m.sender]?.name || m.sender.split('@')[0]
    const message = `👤 User \`<${name}>\`

ⴵ Work » *${formatTime(cooldowns.work)}*
ⴵ Slut » *${formatTime(cooldowns.slut)}*
ⴵ Crime » *${formatTime(cooldowns.crime)}*
ⴵ Daily » *${formatTime(cooldowns.daily)}*
ⴵ Mine » *${formatTime(cooldowns.mine)}*
ⴵ Ritual » *${formatTime(cooldowns.ritual)}*
ⴵ Roulette » *${formatTime(cooldowns.rt)}*
ⴵ Steal » *${formatTime(cooldowns.steal)}*
ⴵ RPS » *${formatTime(cooldowns.rps)}*
ⴵ Weekly » *${formatTime(cooldowns.weekly)}*
ⴵ Monthly » *${formatTime(cooldowns.monthly)}*

⛁ Total Coins » ¥${coins.toLocaleString()} ${global.db.data.settings[botId].currency}`

    await client.sendMessage(chatId, {
      text: message
    }, { quoted: m })
  }
};