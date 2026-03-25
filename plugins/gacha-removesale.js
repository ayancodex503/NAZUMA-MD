export default {
  command: ['removesale'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const characterName = args.join(' ')?.trim()?.toLowerCase()

    if (db.chats[chatId].adminonly || !db.chats[chatId].gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    if (!characterName) return m.reply('✎ Specify the name of the character you want to cancel.')

    const chatData = db.chats[chatId]
    const userData = chatData?.users?.[userId]

    if (!userData) return m.reply(' No user data found in this group.')

    if (!userData.charactersForSale?.length) return m.reply(' You have no characters for sale.')

    const index = userData.charactersForSale.findIndex(
      (p) => p.name?.toLowerCase() === characterName,
    )
    if (index === -1)
      return m.reply(` Character *${characterName}* not found in your sales list.`)

    const canceledCharacter = userData.charactersForSale.splice(index, 1)[0]
    userData.characters ||= []
    userData.characters.push(canceledCharacter)

    await client.sendMessage(
      chatId,
      {
        text: `✎ Your character *${canceledCharacter.name}* has been removed from sale.`,
      },
      { quoted: m },
    )
  },
};