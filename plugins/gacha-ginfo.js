export default {
  command: ['gachainfo', 'ginfo', 'infogacha'],
  category: 'gacha',
  run: async (client, m, args) => {
    const chatId = m.chat
    const userId = m.sender
    const chatData = db.data.chats[chatId]
    const user = chatData.users[userId]
    const now = Date.now()

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    const cooldowns = {
      vote: Math.max(0, (user.voteCooldown || 0) - now),
      roll: Math.max(0, (user.rwCooldown || 0) - now),
      claim: Math.max(0, (user.claimCooldown || 0) - now)
    }

    const formatTime = (ms) => {
      const totalSeconds = Math.floor(ms / 1000)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      const parts = []
      if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`)
      if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
      if (seconds > 0) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`)
      return parts.join(' ')
    }

    const name = db.data.users[userId]?.name || userId.split('@')[0]
    const characters = user.characters || []
    const totalValue = characters.reduce((acc, char) => acc + (char.value || 0), 0)

    const message = `👤 User \`<${name}>\`

ⴵ RollWaifu » *${cooldowns.roll > 0 ? formatTime(cooldowns.roll) : 'Now.'}*
ⴵ Claim » *${cooldowns.claim > 0 ? formatTime(cooldowns.claim) : 'Now.'}*
ⴵ Vote » *${cooldowns.vote > 0 ? formatTime(cooldowns.vote) : 'Now.'}*

♡ Claimed characters » *${characters.length}*
✰ Total value » *${totalValue.toLocaleString()}*`

    await client.sendMessage(chatId, { text: message }, { quoted: m })
  }
};