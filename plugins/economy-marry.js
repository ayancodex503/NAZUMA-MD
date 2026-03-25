let proposals = {}
import { resolveLidToRealJid } from "../lib/utils.js"

export default {
  command: ['marry'],
  category: 'rpg',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const proposer = m.sender
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)
    const proposee = await resolveLidToRealJid(who2, client, m.chat);

    if (!who2)
      return m.reply('Mention the user you want to propose to.')

    if (proposer === proposee)
      return m.reply('You cannot propose to yourself.')

    if (db.users[proposer]?.marry)
      return m.reply(`You are already married to *${db.users[db.users[proposer].marry]?.name || 'someone'}*.`)

    if (db.users[proposee]?.marry)
      return m.reply(` *${db.users[proposee].name || proposee.split('@')[0]}* is already married to *${db.users[db.users[proposee].marry]?.name || 'someone'}*.`)

    setTimeout(() => {
      delete proposals[proposer]
    }, 120000)

    if (proposals[proposee] === proposer) {
      delete proposals[proposee]
      db.users[proposer].marry = proposee
      db.users[proposee].marry = proposer
      return m.reply(`✎ Congratulations, *${db.users[proposer].name || proposer.split('@')[0]}* and *${db.users[proposee].name || proposee.split('@')[0]}* are now married.`)
    } else {
      proposals[proposer] = proposee
      return client.sendMessage(chatId, {
        text: `✎ @${proposee.split('@')[0]}, user @${proposer.split('@')[0]} has sent you a marriage proposal.\n\n⚘ *Reply with:*\n> *_marry @${proposer.split('@')[0]}_* to confirm.\n> The proposal will expire in 2 minutes.`,
        mentions: [proposer, proposee]
      }, { quoted: m })
    }
  }
};