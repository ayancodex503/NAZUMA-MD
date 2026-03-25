export default {
  command: ['delchar', 'delwaifu', 'deletechar'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const chatData = db.chats[chatId]
    const userData = chatData?.users[userId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    if (!userData?.characters?.length)
      return m.reply(' You have no claimed characters in your inventory.')

    if (!args[0])
      return m.reply(
        '✎ You must specify the name of the character you want to delete.',
      )

    const characterName = args.join(' ').toLowerCase()
    const characterIndex = userData.characters.findIndex(
      (c) => c.name?.toLowerCase() === characterName,
    )

    if (characterIndex === -1)
      return m.reply(` The character *${args.join(' ')}* is not in your inventory.`)

    const removed = userData.characters.splice(characterIndex, 1)[0]

    return m.reply(
      `✐ The character *${removed.name}* has been successfully removed from your inventory.`,
    )
  },
};