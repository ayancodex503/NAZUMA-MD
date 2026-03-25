import moment from 'moment-timezone';
import { resolveLidToRealJid } from "../lib/utils.js"

export default {
  command: ['profile'],
  category: 'rpg',
  run: async (client, m) => {
    const texto = m.mentionedJid
    const who2 = texto.length > 0 ? texto[0] : m.quoted ? m.quoted.sender : m.sender
    const userId = await resolveLidToRealJid(who2, client, m.chat);

    const chat = global.db.data.chats[m.chat] || {}
    const chatUsers = chat.users || {}
    const globalUsers = global.db.data.users || {}
   const userss = global.db.data.chats[m.chat].users[userId] || {}

    if (!userss) {
      return m.reply('✎ The *mentioned* user is not *registered* with the bot')
    }

    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net' || ''
    const settings = global.db.data.settings[idBot] || {}
    const currency = settings.currency || ''

    const user = chatUsers[userId] || {}
    const user2 = globalUsers[userId] || {}

    const name = user2.name || ''
    const birth = user2.birth || 'Not specified'
    const gender = user2.genre || 'Hidden'
    const commands = user2.usedcommands || '0'
    const partner = user2.marry ? `${globalUsers[user2.marry].name}` : 'No one'
    const maritalStatus =
      gender === 'Female' ? 'Married to' : gender === 'Male' ? 'Married to' : 'Married to'
    const desc = user2.description ? `\n\n${user2.description}` : ''
    const hobby = user2.pasatiempo ? `${user2.pasatiempo}` : 'Not defined'
    const exp = user2.exp || 0
    const level = user2.level || 0
    const chocolates = user.coins || 0
    const bank = user.bank || 0
    const totalCoins = chocolates + bank
    const harem = user?.characters?.length || 0

    const profile = await client
      .profilePictureUrl(userId, 'image')
      .catch((_) => 'https://files.catbox.moe/xiuy77.jpg')

    const users = Object.entries(globalUsers).map(([key, value]) => ({ ...value, jid: key }))
    const sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0))
    try {
    const rank = sortedLevel.findIndex((u) => u.jid === userId) + 1

    const profileText = `「✿」 *Profile* ◢ ${name} ◤

♛ Birthday › *${birth}*
♛ Hobby › *${hobby}*
♛ Gender › *${gender}*
♡ ${maritalStatus} › *${partner}*${desc}

✿ Level › *${level}*
❀ Experience › *${exp.toLocaleString()}*
☆ Rank › *#${rank}*

ꕥ Harem › *${harem.toLocaleString()}*
✰ Total Money › *¥${totalCoins.toLocaleString()} ${currency}*
❒ Commands executed › *${commands.toLocaleString()}*`

    await client.sendMessage(
      m.chat,
      {
        image: { url: profile },
        caption: profileText,
      },
      { quoted: m },
    )
  } catch (e) {
  m.reply(msgglobal)
  }
  }
};