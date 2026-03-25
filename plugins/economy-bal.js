import { resolveLidToRealJid } from "../lib/utils.js"

export default {
  command: ['balance', 'bal'],
  category: 'rpg',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
    const botSettings = db.settings[botId]
    const currency = botSettings.currency

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : m.sender)
    const who = await resolveLidToRealJid(who2, client, m.chat);

    if (!chatData.users?.[who2])
      return m.reply(`「✎」 The mentioned user is not registered with the bot.`)

    const user = chatData.users[who]
    const total = (user.coins || 0) + (user.bank || 0)

    const bal = `User \`<${global.db.data.users[who].name}>\`

⛀ Cash › *¥${user.coins?.toLocaleString() || 0} ${currency}*
⚿ Bank › *¥${user.bank?.toLocaleString() || 0} ${currency}*
⛁ Total › *¥${total.toLocaleString()} ${currency}*

> _To protect your money, deposit it in the bank using ${prefa}deposit!_`

    await client.sendMessage(chatId, { text: bal }, { quoted: m })
  }
};