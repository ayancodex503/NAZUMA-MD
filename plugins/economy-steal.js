import { resolveLidToRealJid } from "../lib/utils.js"

export default {
  command: ['steal', 'rob'],
  category: 'rpg',
  run: async (client, m) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const currency = botSettings.currency
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    const mentioned = m.mentionedJid || []
    const who2 = mentioned[0] || (m.quoted ? m.quoted.sender : null)
    const target = await resolveLidToRealJid(who2, client, m.chat);

    if (!who2 || target === m.sender)
      return m.reply(`You must mention who you want to steal *${currency}* from.`)

    const senderData = chatData.users[m.sender]
    const targetData = chatData.users[target]

    if (!targetData) {
      return m.reply('The *mentioned* user is not *registered* with the bot')
    }

    if (targetData.coins < 50)
      return m.reply(
        `*${db.users[target]?.name || target.split('@')[0]}* doesn't have enough *${currency}* to steal from.`,
      )

    senderData.stealCooldown ||= 0
    const remainingTime = senderData.stealCooldown - Date.now()

    if (remainingTime > 0)
      return m.reply(
        `You must wait *${msToTime(remainingTime)}* before trying to steal again.`,
      )

    senderData.stealCooldown = Date.now() + 30 * 60 * 1000 // 30 minutes

    const stolenAmount = Math.min(Math.floor(Math.random() * 5000) + 50, targetData.coins)
    senderData.coins += stolenAmount
    targetData.coins -= stolenAmount

    await client.sendMessage(
      chatId,
      {
        text: `You stole *¥${stolenAmount.toLocaleString()} ${currency}* from *${db.users[target]?.name || target.split('@')[0]}*.`,
        mentions: [target],
      },
      { quoted: m },
    )
  },
};

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  return `${minutes} minute${minutes !== 1 ? 's' : ''}, ${seconds} second${seconds !== 1 ? 's' : ''}`
}