import { resolveLidToRealJid } from "../lib/utils.js"

export default {
  command: ['giveallharem'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    const text = m.mentionedJid
    const who2 = text.length > 0 ? text[0] : m.quoted ? m.quoted.sender : false
    const mentionedJid = await resolveLidToRealJid(who2, client, m.chat);

    if (!who2 || mentionedJid === senderId)
      return m.reply('✎ Mention the user you want to give all your characters to.')

    if (!chatData.users?.[senderId]?.characters?.length)
      return m.reply(' You have no characters in your inventory.')

   const user2 = global.db.data.chats[m.chat].users[mentionedJid]

    if (!user2) {
      return m.reply('The *mentioned* user is not *registered* with the bot')
    }

    chatData.users[mentionedJid] ||= {
      characters: [],
      characterCount: 0,
      totalRwcoins: 0,
    }

    const fromUser = chatData.users[senderId]
    const toUser = chatData.users[mentionedJid]

    fromUser.characters.forEach((c) => {
      toUser.characters.push(c)
      toUser.characterCount++
      toUser.totalRwcoins += c.value || 0
    })

    fromUser.characters = []
    fromUser.characterCount = 0
    fromUser.totalRwcoins = 0

    const receiverName = db.users[mentionedJid]?.name || mentionedJid.split('@')[0]
    const message = `✎ You gave all your characters to user *${receiverName}*.`

    await client.sendMessage(chatId, { text: message }, { quoted: m })
  },
};