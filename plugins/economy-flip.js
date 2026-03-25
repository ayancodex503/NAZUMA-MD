export default {
  command: ['cf', 'flip', 'coinflip'],
  category: 'rpg',
  run: async (client, m, args) => {
    const chat = global.db.data.chats[m.chat]
    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = global.db.data.settings[botId]
    const currency = botSettings.currency

    if (chat.adminonly || !chat.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    const amount = parseInt(args[0])
    const choice = args[1]?.toLowerCase()

    if (!choice || isNaN(amount)) {
      return m.reply(
        `Choose an option ( *Heads or Tails* ) and the amount to bet, to flip the coin.\n\n\`Example\`\n> *${prefa}cf* 2000 heads`,
      )
    }

    if (!['heads', 'tails'].includes(choice)) {
      return m.reply(
        `Invalid choice. Please choose heads or tails.`,
      )
    }

    if (amount <= 199) {
      return m.reply(
        `Please choose an amount greater than 200 ${currency} to bet.`,
      )
    }

    if (user.coins < amount) {
      return m.reply(`You don't have enough *${currency}* to bet.`)
    }

    const result = Math.random() < 0.5 ? 'heads' : 'tails'
    const amountFormatted = amount.toLocaleString()
    let message = `✎ The coin landed on *${result}*.\n`

    if (result === choice) {
      user.coins += amount
      message += `You won *¥${amountFormatted} ${currency}!`
    } else {
      user.coins -= amount
      message += `You lost *¥${amountFormatted} ${currency}.`
    }

    await client.sendMessage(m.chat, { text: message }, { quoted: m })
  },
};