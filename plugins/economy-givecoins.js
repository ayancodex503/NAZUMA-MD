import { resolveLidToRealJid } from "../lib/utils.js"

export default {
  command: ['givecoins', 'pay', 'coinsgive'],
  category: 'rpg',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const currency = botSettings.currency || 'coins'
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    const [amountInputRaw, ...rest] = args
    const mentioned = m.mentionedJid || []
    const who2 = mentioned[0] || args.find(arg => arg.includes('@s.whatsapp.net'))
    const who = await resolveLidToRealJid(who2, client, m.chat);
    if (!who2) return m.reply(`You must mention who you want to transfer *${currency}* to.`)

    const senderData = chatData.users[m.sender]
    const targetData = chatData.users[who]

    if (!targetData) return m.reply(`The mentioned user is not registered with the bot.`)

    const amountInput = amountInputRaw?.toLowerCase()
    const amount = amountInput === 'all'
      ? senderData.coins
      : parseInt(amountInput)

    if (!amountInput || isNaN(amount) || amount <= 0)
      return m.reply(`Enter a valid amount of *${currency}* to transfer.`)

    if (senderData.coins < amount)
      return m.reply(`You don't have enough *${currency}* to transfer ${amount}.`)

    senderData.coins -= amount
    targetData.coins += amount

    try {
      const amountFormatted = amount.toLocaleString()
      const transferText = `*¥${amountFormatted} ${currency}*`

      await client.sendMessage(
        chatId,
        {
          text: `✎ You transferred ${transferText} to *@${who.split('@')[0]}*.`,
          mentions: [who],
        },
        { quoted: m }
      )
    } catch (e) {
      await m.reply(`Error sending transfer confirmation.`)
    }
  }
};