export default {
  command: ['dep', 'deposit', 'd'],
  category: 'rpg',
  run: async (client, m, args) => {
    const chatData = global.db.data.chats[m.chat]
    const user = chatData.users[m.sender]
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = global.db.data.settings[idBot]
    const currency = settings.currency

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✐ These commands are disabled in this group.`)

    if (!args[0]) {
      return m.reply(
        `Enter the amount of *${currency}* you want to *deposit*.`,
      )
    }

    if (args[0] < 1 && args[0].toLowerCase() !== 'all') {
      return m.reply('✎ Enter a *valid* amount to deposit')
    }

    if (args[0].toLowerCase() === 'all') {
      if (user.coins <= 0) return m.reply(`✎ You don't have *${currency}* to deposit in your *bank*`)

      const count = user.coins
      user.coins = 0
      user.bank += count
      await m.reply(`You have deposited *¥${count.toLocaleString()} ${currency}* into your Bank`)
      return true
    }

    if (!Number(args[0]) || parseInt(args[0]) < 1) {
      return m.reply('Enter a *valid* amount to deposit')
    }

    const count = parseInt(args[0])
    if (user.coins <= 0 || user.coins < count) {
      return m.reply(`You don't have enough *${currency}* to deposit`)
    }

    user.coins -= count
    user.bank += count
    await m.reply(`You have deposited *¥${count.toLocaleString()} ${currency}* into your Bank`)
  },
};