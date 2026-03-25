const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const pad = (n) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} second${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minute${minutes !== 1 ? 's' : ''}, ${pad(seconds)} second${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['deathroulette'],
  category: 'rpg',
  botAdmin: true,
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
    const currency = botSettings.currency || 'Coins'

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    const cooldown = 15 * 60 * 1000
    const now = Date.now()
    const remaining = (user.deathCooldown || 0) - now

    if (remaining > 0)
      return m.reply(`☠️ You must wait *${msToTime(remaining)}* to play again.`)

    const total = (user.coins || 0) + (user.bank || 0)
    if (total <= 0) return m.reply('You have nothing to bet...')

    user.deathCooldown = now + cooldown

    await client.sendMessage(chatId, {
      text: `☠️ *DEATH ROULETTE*\n\n🎲 Spinning...\n⏳ Result in 1 minute...`,
      mentions: [senderId],
    }, { quoted: m })

    await new Promise(r => setTimeout(r, 60000))

    const survive = Math.random() < 0.25

    const groupInfo = await client.groupMetadata(chatId)
    const ownerGroup = groupInfo.owner || chatId.split`-`[0] + '@s.whatsapp.net'
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net'
    const botNumber = client.decodeJid(client.user.id)

    if (survive) {
      const reward = Math.floor(total * (2 + Math.random() * 2))
      user.coins += reward

      return client.sendMessage(chatId, {
        text: `🟢 YOU SURVIVED!\n\n💰 You won *¥${reward.toLocaleString()} ${currency}*`,
        mentions: [senderId],
      }, { quoted: m })
    }

    user.coins = 0
    user.bank = 0

    await client.sendMessage(chatId, {
      text: `💀 YOU DIED...\n\nYou lost all your ${currency}...`,
      mentions: [senderId],
    }, { quoted: m })

    if (
      senderId === botNumber ||
      senderId === ownerGroup ||
      senderId === ownerBot
    ) {
      return m.reply('⚠️ I cannot remove this user.')
    }

    try {
      await client.groupParticipantsUpdate(chatId, [senderId], 'remove')
    } catch (e) {
      await m.reply('I could not remove the user (am I admin?)')
    }
  },
}