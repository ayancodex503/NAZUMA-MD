import {readFileSync} from 'fs';
import { resolveLidToRealJid } from "../lib/utils.js"

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} of ${months[date.getMonth()]} ${date.getFullYear()}`
}

export default {
  command: ['givechar', 'givewaifu', 'gift'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender
    const chatData = db.chats[chatId]
    const senderData = chatData.users[senderId]
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : m.quoted ? m.quoted.sender : false
    const mentionedJid = await resolveLidToRealJid(who2, client, m.chat);

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    if (!who2 || mentionedJid === senderId)
      return m.reply('✎ Mention the user and the name of the waifu you want to gift.')

    if (!senderData?.characters?.length) return m.reply(' You have no characters in your inventory.')

   const user2 = global.db.data.chats[m.chat].users[mentionedJid]

    if (!user2) {
      return m.reply('The *mentioned* user is not *registered* with the bot')
    }

    const characterName = args
      .filter((arg) => !arg.includes(mentionedJid.split('@')[0]))
      .join(' ')
      .toLowerCase()
      .trim()
    const characterIndex = senderData.characters.findIndex(
      (c) => c.name?.toLowerCase() === characterName,
    )

    if (characterIndex === -1)
      return m.reply(`You don't have the character *${characterName}* in your inventory.`)

    try {
      const characterDetails = JSON.parse(readFileSync('./lib/characters.json', 'utf8'))
      const original = characterDetails.find((c) => c.name.toLowerCase() === characterName)

      if (!original)
        return m.reply(`✎ Character *${characterName}* not found in the database.`)

      const reservedCharacter = {
        name: original.name,
        value: original.value,
        gender: original.gender,
        source: original.source,
        keyword: original.keyword,
        claim: formatDate(Date.now()),
      }

      if (!chatData.users[mentionedJid]) {
        chatData.users[mentionedJid] = {
          characters: [],
          characterCount: 0,
          totalRwcoins: 0,
          chocolates: 0,
        }
      }

      const receiver = chatData.users[mentionedJid]

      if (!Array.isArray(receiver.characters)) {
        receiver.characters = []
      }

      receiver.characters.push(reservedCharacter)
      receiver.characterCount++
      receiver.totalRwcoins += reservedCharacter.value || 0

      senderData.characters.splice(characterIndex, 1)
      senderData.characterCount--
      senderData.totalRwcoins -= reservedCharacter.value || 0

      const receiverName = db.users[mentionedJid]?.name || mentionedJid.split('@')[0]
      const message = `✎ *${reservedCharacter.name}* has been gifted to *${receiverName}*.`

      await client.sendMessage(chatId, { text: message }, { quoted: m })
    } catch (e) {
      await client.sendMessage(chatId, { text: msgglobal }, { quoted: m })
    }
  },
};