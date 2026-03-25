export default {
  command: ['sell'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data || ''
    const chatId = m.chat
    const userId = m.sender
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const currency = botSettings.currency
    const botname = botSettings.namebot2

    const chatData = db.chats[chatId] || {}
    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    try {
      const priceCoins = parseInt(args[0])
      const characterName = args.slice(1).join(' ').trim().toLowerCase()

      if (!characterName || isNaN(priceCoins))
        return m.reply(
          '✎ Specify the value and the name of the waifu to sell.'
        )

      const userData = chatData.users[userId] || {}
      if (!userData?.characters?.length) return m.reply(' You have no characters in your inventory.')

      const characterIndex = userData.characters.findIndex(
        (c) => c.name?.toLowerCase() === characterName,
      )
      if (characterIndex === -1)
        return m.reply(`You don't have the character *${characterName}* in your inventory.`)

      if (priceCoins < 5000)
        return m.reply(`The minimum price to sell a character is *¥5,000 ${currency}*.`)

      if (priceCoins > 20000000)
        return m.reply(
          `The maximum price to sell a character is *¥20,000,000 ${currency}*.`,
        )

      const character = userData.characters[characterIndex]
      const expires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()

      userData.charactersForSale ||= []
      userData.charactersForSale.push({
        ...character,
        price: priceCoins,
        seller: userId,
        expires,
      })

      userData.characters.splice(characterIndex, 1)

      const message = `✎ *${character.name}* has been put up for sale!\n\n> Seller › *@${userId.split('@')[0]}*\n> ⛁ Price › *${priceCoins.toLocaleString()} ${currency}*\n> Expires in › *3 days*\n\n${dev}`
      await client.sendMessage(chatId, { text: message, mentions: [userId] }, { quoted: m })
    } catch (e) {
      await m.reply(msgglobal)
    }
  },
};

setInterval(
  () => {
    const db = global.db.data || ''
    for (const chatId in db.chats || {}) {
      const chatData = db.chats[chatId] || {}
      for (const userId in chatData.users || {}) {
        const user = chatData.users[userId] || {}
        user.charactersForSale =
          user.charactersForSale?.filter((p) => {
            const exp = new Date(p.expires)
            const expired = Date.now() > exp
            if (expired) {
              user.characters ||= []
              user.characters.push(p)
            }
            return !expired
          }) || []
      }
    }
  },
  60 * 60 * 1000,
)