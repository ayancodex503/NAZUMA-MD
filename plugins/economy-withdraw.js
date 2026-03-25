export default {
  command: ['withdraw', 'with'],
  category: 'rpg',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    const user = chatData.users[m.sender]
    const currency = botSettings.currency || 'Coins'

    if (!args[0]) return m.reply(`Enter the amount of *${currency}* you want to withdraw.`)

    if (args[0].toLowerCase() === 'all') {
      if ((user.bank || 0) <= 0)
        return m.reply(`You don't have *${currency}* to withdraw from your Bank.`)

      const amount = user.bank
      user.bank = 0
      user.coins = (user.coins || 0) + amount

      return m.reply(`✎ You have withdrawn *¥${amount.toLocaleString()} ${currency}* from your Bank.`)
    }

    const count = parseInt(args[0])
    if (isNaN(count) || count < 1) return m.reply(`Enter a valid amount to withdraw.`)

    if ((user.bank || 0) < count)
      return m.reply(
        `You don't have enough *${currency}* in your bank to withdraw that amount.`,
      )

    user.bank -= count
    user.coins = (user.coins || 0) + count

    await m.reply(`✎ You have withdrawn *¥${count.toLocaleString()} ${currency}* from your Bank.`)
  },
};