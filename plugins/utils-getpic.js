import { resolveLidToRealJid } from "../lib/utils.js"

export default {
  command: ['pfp', 'getpic'],
  category: 'utils',
  run: async (client, m) => {
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : m.quoted ? m.quoted.sender : false
    const who = await resolveLidToRealJid(who2, client, m.chat);

    if (!who2)
      return m.reply(`Tag or mention the user whose profile picture you want to see.`)

    try {
      const img = await client.profilePictureUrl(who, 'image').catch(() => null)

      if (!img)
        return client.sendMessage(
          m.chat,
          {
            text: `Could not get profile picture of @${who.split('@')[0]}.`,
            mentions: [who],
          },
          { quoted: m },
        )

      await client.sendMessage(m.chat, { image: { url: img }, caption: null }, { quoted: m })
    } catch {
      await m.reply(msgglobal)
    }
  },
};