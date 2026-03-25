import { resolveLidToRealJid } from "../lib/utils.js"

export default {
  command: ['setbotowner'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...global.owner.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)
    const who = await resolveLidToRealJid(who2, client, m.chat);
    const menti = client.user.id.split(':')[0] + "@s.whatsapp.net"
    if (!who2) {
     return client.reply(m.chat, `✐ You must mention the new bot owner.\n> Example: *${prefa}setbotowner @${menti.split('@')[0]}*`, m, { mentions: [menti] })
    }

const previousOwner = config.owner
const isChange = previousOwner && previousOwner.endsWith('@s.whatsapp.net')

config.owner = who

const message = isChange
  ? ` The bot owner has been changed from @${previousOwner.split('@')[0]} to @${who.split('@')[0]}!`
  : ` The new owner of *${config.namebot2}* is @${who.split('@')[0]}!`

return m.reply(message, {
  mentions: isChange ? [previousOwner, who] : [who]
})
  },
};