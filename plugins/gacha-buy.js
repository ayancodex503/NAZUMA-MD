function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  return minutes === 0
    ? `${seconds} second${seconds > 1 ? 's' : ''}`
    : `${minutes} minute${minutes > 1 ? 's' : ''}, ${seconds} second${seconds > 1 ? 's' : ''}`
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} of ${months[date.getMonth()]} ${date.getFullYear()}`
}

export default {
  command: ['claim', 'buy', 'c'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const chatConfig = db.chats[chatId]
    const botSettings = db.settings[botId]
    const currency = botSettings.currency
    const user = chatConfig.users[userId]

    if (chatConfig.adminonly || !chatConfig.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    if (!user.buyCooldown) user.buyCooldown = 0
    const remainingTime = user.buyCooldown - Date.now()
    if (remainingTime > 0)
      return m.reply(
        `You must wait *${msToTime(remainingTime)}* to use *"${m.command}"* again`,
      )

    if (!m.quoted) return m.reply(`✎ Reply to a waifu to claim it.`)

    chatConfig.users ||= {}
    chatConfig.reservedCharacters ||= []

    const quotedMessage = m.quoted.body || m.quoted.text || ''
    const reservedCharacter = chatConfig.reservedCharacters.find((p) =>
      quotedMessage.includes(p.name),
    )

    if (!reservedCharacter) {
      const claimedEntry = Object.entries(chatConfig.users).find(([_, u]) =>
        u.characters?.some((c) => quotedMessage.includes(c.name)),
      )
      if (claimedEntry) {
        const [claimerId, u] = claimedEntry
        const claimedChar = u.characters.find((c) => quotedMessage.includes(c.name))
        if (claimerId === userId) return m.reply(`✎ You have already claimed *${claimedChar.name}*.`)
        const ownerName = db.users[claimerId]?.name || claimerId.split('@')[0]
        return m.reply(
          `✎ The character *${claimedChar.name}* has already been claimed by *${ownerName}*.`,
        )
      }
      return m.reply(` Could not identify or claim the character.`)
    }

    const alreadyClaimed = Object.entries(chatConfig.users).find(([_, u]) =>
      u.characters?.some((c) => c.name === reservedCharacter.name),
    )
    if (alreadyClaimed) {
      const [claimerId] = alreadyClaimed
      if (claimerId === userId)
        return m.reply(` You have already claimed *${reservedCharacter.name}*.`)
      const ownerName = db.users[claimerId]?.name || claimerId.split('@')[0]
      return m.reply(
        `✎ The character *${reservedCharacter.name}* has already been claimed by *${ownerName}*.`,
      )
    }

    const now = Date.now()
    if (reservedCharacter.reservedBy && now < reservedCharacter.reservedUntil) {
      const isUserReserver = reservedCharacter.reservedBy === userId
      const reserverName =
        db.users[reservedCharacter.reservedBy]?.name || reservedCharacter.reservedBy.split('@')[0]
      const secondsLeft = ((reservedCharacter.reservedUntil - now) / 1000).toFixed(1)
      if (!isUserReserver)
        return m.reply(
          `✎ *${reservedCharacter.name}* is protected by *${reserverName}* for *${secondsLeft}s*`,
        )
    }

    if (
      reservedCharacter.expiresAt &&
      now > reservedCharacter.expiresAt &&
      !reservedCharacter.user &&
      !(reservedCharacter.reservedBy && now < reservedCharacter.reservedUntil)
    ) {
      const expiredTime = ((now - reservedCharacter.expiresAt) / 1000).toFixed(1)
      return m.reply(
        `The character *${reservedCharacter.name}* expired *${expiredTime}s* ago.`,
      )
    }

    chatConfig.users[userId] ||= { characters: [], characterCount: 0, totalRwcoins: 0 }
    const userData = chatConfig.users[userId]

    if (user.coins < reservedCharacter.value)
      return m.reply(
        ` You don't have enough *${currency}* to buy *${reservedCharacter.name}*.`,
      )

    userData.characters ||= []
    userData.characters.push({
      name: reservedCharacter.name,
      value: reservedCharacter.value,
      gender: reservedCharacter.gender,
      source: reservedCharacter.source,
      keyword: reservedCharacter.keyword,
      claim: formatDate(now),
      user: userId,
    })

    userData.characterCount++
    userData.totalRwcoins += reservedCharacter.value
    chatConfig.reservedCharacters = chatConfig.reservedCharacters.filter(
      (p) => p.id !== reservedCharacter.id,
    )
    user.buyCooldown = now + 15 * 60000
    user.coins -= reservedCharacter.value

    const displayName = db.users[userId]?.name || userId.split('@')[0]
    delete reservedCharacter.reservedBy
    delete reservedCharacter.reservedUntil
    const duration = ((now - reservedCharacter.expiresAt + 60000) / 1000).toFixed(1)

    const phrases = [
      `*${reservedCharacter.name}* has been claimed by *${displayName}*`,
      `*${displayName}* took *${reservedCharacter.name}* to the Easter Valley`,
      `*${displayName}* took *${reservedCharacter.name}* to bed`,
      `*${displayName}* took *${reservedCharacter.name}* on a honeymoon`,
      `*${reservedCharacter.name}* recruited by *${displayName}* for acts of terrorism`,
      `*${displayName}* has claimed *${reservedCharacter.name}*`,
      `*${displayName}* made *${reservedCharacter.name}* question their existence`,
      `*${displayName}* took *${reservedCharacter.name}* to explore the multiverse`,
      `*${reservedCharacter.name}* is now a faithful companion of *${displayName}* in a thousand adventures`,
      `*${displayName}* stole the heart of *${reservedCharacter.name}* with a glance`,
      `*${reservedCharacter.name}* was chosen by *${displayName}* to rule the kingdom together`,
      `*${displayName}* sparked the flame in *${reservedCharacter.name}*, and there was no turning back`,
      `*${reservedCharacter.name}* fell for the charms of *${displayName}*`,
      `*${displayName}* invited *${reservedCharacter.name}* to an unforgettable night under the stars`,
      `*${displayName}* unleashed intense emotions in *${reservedCharacter.name}* with just a sigh`,
      `*${reservedCharacter.name}* and *${displayName}* disappeared among whispers and burning glances`,
    ]

    const final = phrases[Math.floor(Math.random() * phrases.length)]
    await client.sendMessage(chatId, { text: `✎ ${final} _(${duration}s)_` }, { quoted: m })
  },
};