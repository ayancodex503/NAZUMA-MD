const findCharacterByName = (name, characters) => {
  return characters.find((p) => p.name?.toLowerCase() === name.toLowerCase())
}

export default {
  command: ['trade'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    if (chatData.timeTrade && chatData.timeTrade - Date.now() > 0)
      return m.reply('There is already a trade in progress. Wait for it to complete or expire.')

    const parts = args
      .join(' ')
      .split('/')
      .map((s) => s.trim())
    if (parts.length !== 2)
      return m.reply(
        `✎ Use the correct format:\n› *${prefa}trade Your character / Other user's character*`,
      )

    const [character1Name, character2Name] = parts
    const userData = chatData.users[userId]?.characters || []
    const character1 = findCharacterByName(character1Name, userData)

    const character2UserEntry = Object.entries(chatData.users || {}).find(([_, u]) =>
      u.characters?.some((c) => c.name?.toLowerCase() === character2Name.toLowerCase()),
    )
    const character2UserId = character2UserEntry?.[0]
    const character2UserData = character2UserEntry?.[1]?.characters || []
    const character2 = findCharacterByName(character2Name, character2UserData)

    if (!character1) return m.reply(` You don't have the character *${character1Name}*.`)
    if (!character2)
      return m.reply(` The character *${character2Name}* is not available for trade.`)

    chatData.trades ||= []
    chatData.trades.push({
      requester: userId,
      character1,
      character2,
      recipient: character2UserId,
      expiration: Date.now() + 60000,
    })

    chatData.timeTrade = Date.now() + 60000

    const requestMessage = ` @${character2UserId.split('@')[0]}, @${userId.split('@')[0]} has sent you a trade request\n\n✎ *${character2.name}* ⇄ *${character1.name}*\n> To accept, use › *${prefa}accepttrade* within 1 minute.

${dev}`
    await client.sendMessage(
      chatId,
      { text: requestMessage, mentions: [userId, character2UserId] },
      { quoted: m },
    )
  },
};