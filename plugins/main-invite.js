function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100)
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  return `${minutes} Minute(s) ${seconds} Second(s)`
}

const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})(?:\s+[0-9]{1,3})?/i

async function getGroupName(client, chatId) {
  try {
    const metadata = await client.groupMetadata(chatId)
    return metadata.subject || 'Unknown group'
  } catch {
    return 'Private chat'
  }
}

export default {
  command: ['invite', 'join'],
  category: 'info',
  run: async (client, m, args) => {
    const user = global.db.data.chats[m.chat].users[m.sender]
    const group = m.isGroup ? await getGroupName(client, m.chat) : 'Private chat'

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = global.db.data.settings[botId]
    const botname = botSettings.namebot2

    const cooldown = 600000
    const nextTime = user.jointime + cooldown
    if (new Date() - user.jointime < cooldown) {
      return m.reply(
        ` Wait *${msToTime(nextTime - new Date())}* to send another invitation.`,
      )
    }

    const link = args.join(' ')
    const match = link.match(linkRegex)
    if (!match || !match[1]) {
      return m.reply(' The entered link is invalid or incomplete.')
    }

    if (!args || !args.length) {
      return m.reply(' Enter the link to invite the bot to your group.')
    }

    const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isPremiumBot = botSettings?.botprem === true
    const isModBot = botSettings?.botmod === true

    const botType = isOficialBot
      ? 'Principal/Owner'
      : isPremiumBot
        ? 'Premium'
        : isModBot
          ? 'Principal/Mod'
          : 'Sub Bot'

    const sugg = `𝗥𝗘𝗤𝗨𝗘𝗦𝗧 𝗥𝗘𝗖𝗘𝗜𝗩𝗘𝗗

✩ *User ›* ${global.db.data.users[m.sender].name}
✿ *Link ›* ${args.join(' ')}
✿ *Chat ›* ${group}

➤ 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢
♡ *Socket ›* ${botType}
★ *Name ›* ${botname}
❐ *Version ›* ${version}`

    if (typeof sugg !== 'string' || !sugg.trim()) return

    for (const num of global.mods) {
      const jid = `${num}@s.whatsapp.net`
      try {
        await client.sendMessage(jid, { text: sugg })
      } catch (e) {
        m.reply(`Could not send to ${jid}.`)
      }
    }

    await client.reply(
      m.chat,
      ' Invitation link sent successfully to the Developers.',
      m,
    )

    user.jointime = new Date() * 1
  },
};