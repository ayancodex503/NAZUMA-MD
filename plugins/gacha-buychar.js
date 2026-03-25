export default {
  command: ['buycharacter', 'buychar', 'buyc'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const chatData = db.chats[chatId]
    const user = chatData.users[userId]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const currency = botSettings.currency

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    const characterName = args.join(' ')?.trim()?.toLowerCase()
    if (!characterName)
      return m.reply(
        `✎ Specify the name of the character you want to buy.`,
      )

    if (!chatData.users)
      return m.reply(` No characters available for purchase in this chat.`)

    const charactersForSale = Object.entries(chatData.users).flatMap(
      ([_, userData]) => userData.charactersForSale || [],
    )

    const character = charactersForSale.find((p) => p.name.toLowerCase() === characterName)
    if (!character)
      return m.reply(`✎ Character *${characterName}* not found in the sales list.`)

    if (user.coins < character.price)
      return m.reply(
        ` You don't have enough *${currency}* to buy *${character.name}*. You need *¥${character.price.toLocaleString()}*.`,
      )

    user.coins -= character.price

    const sellerId = character.seller
    const seller = chatData.users[sellerId]
    seller.coins ||= 0
    seller.coins += character.price

    user.characters ||= []
    user.characters.push({ name: character.name, ...character })

    seller.charactersForSale = seller.charactersForSale?.filter(
      (p) => p.name.toLowerCase() !== characterName,
    )

    const buyerName = db.users[userId]?.name || userId.split('@')[0]
    const sellerName = db.users[sellerId]?.name || sellerId.split('@')[0]

    const message = ` *${character.name}* has been purchased by *${buyerName}*.\n\n> *${character.price.toLocaleString()} ${currency}* has been transferred to *${sellerName}*.`

    await client.sendMessage(chatId, { text: message }, { quoted: m })
  },
};