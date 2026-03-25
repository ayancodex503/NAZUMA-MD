export default {
  command: ['accepttrade'],
  category: 'gacha',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const chatData = db.chats[chatId]
    const trade = chatData.trades?.find(
      (i) => i.expiration > Date.now() && i.recipient === userId,
    )

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    if (!trade) return m.reply('✎ You have no active trade requests.')

    const requesterChars = chatData.users[trade.requester].characters || []
    const recipientChars = chatData.users[trade.recipient].characters || []

    chatData.users[trade.requester].characters = [
      ...requesterChars.filter((c) => c.name !== trade.character1.name),
      trade.character2,
    ]

    chatData.users[trade.recipient].characters = [
      ...recipientChars.filter((c) => c.name !== trade.character2.name),
      trade.character1,
    ]

    chatData.trades = chatData.trades.filter((i) => i !== trade)
    chatData.timeTrade = 0

    const confirmationMessage = ` *Trade completed successfully (✿❛◡❛)*\n\n✎ *${trade.character1.name}* now belongs to *${db.users[userId]?.name || userId.split('@')[0]}*\n✎ *${trade.character2.name}* now belongs to *${db.users[trade.requester]?.name || trade.requester.split('@')[0]}*

${dev}`

    await client.sendMessage(chatId, { text: confirmationMessage }, { quoted: m })
  },
};