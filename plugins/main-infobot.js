import os from 'os';

function rTime(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : ""
  const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : ""
  const mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : ""
  const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : ""
  return dDisplay + hDisplay + mDisplay + sDisplay
}

export default {
  command: ['infobot', 'infosocket'],
  category: 'info',
  run: async (client, m) => {
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
    const botSettings = global.db.data.settings[botId] || {}

    const botname = botSettings.namebot || 'QUEEN NAZUMA MINI'
    const botname2 = botSettings.namebot2 || 'QUEEN NAZUMA'
    const monedas = botSettings.currency || 'Coins'
    const banner = botSettings.banner
    const prefijo = botSettings.prefijo
    const owner = botSettings.owner
    const canalId = botSettings.id
    const canalName = botSettings.nameid
    const link = botSettings.link

    let desar = 'Hidden'
    if (owner && !isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))) {
      const userData = global.db.data.users[owner]
      desar = userData?.genre || 'Hidden'
    }

    const platform = os.type()
    const now = new Date()
    const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
    const nodeVersion = process.version
    const systemUptime = rTime(os.uptime())

    const uptime = process.uptime()
    const uptimeDate = new Date(colombianTime.getTime() - uptime * 1000)
    const formattedUptimeDate = uptimeDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/^./, m => m.toUpperCase())

    const isOficialBot = botId === global.client.user.id.split(':')[0] + "@s.whatsapp.net"
    const isPremiumBot = botSettings.botprem === true
    const isModBot = botSettings.botmod === true

    const botType = isOficialBot ? 'Principal/Owner' : isPremiumBot ? 'Premium' : isModBot ? 'Principal/Mod' : 'Sub Bot'

    try {
    const message = `✐ Information about bot *${botname2}!*

✿ *Short Name ›* ${botname2}
✿ *Long Name ›* ${botname}
✦ *Currency ›* ${monedas}
✦ *Prefix ›* ${prefijo}

❒ *Type ›* ${botType}
❒ *Platform ›* ${platform}
❒ *NodeJS ›* ${nodeVersion}
❒ *Active since ›* ${formattedUptimeDate}
❒ *System Active ›* ${systemUptime}
❒ *${desar === 'Male' ? 'Owner' : desar === 'Female' ? 'Owner' : 'Owner'} ›* ${owner ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, '')) ? `@${owner.split('@')[0]}` : owner) : "Hidden for privacy"}

> \`Link:\` ${link}`.trim()

if (banner.endsWith('.mp4') || banner.endsWith('.gif') || banner.endsWith('.webm')) {
await client.sendMessage(
  m.chat,
  {
    video: { url: banner },
    gifPlayback: true,
    caption: message.trim(),
    contextInfo: {
      mentionedJid: [owner, m.sender],
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: canalId,
        serverMessageId: '0',
        newsletterName: canalName,
      }
    }
  },
  { quoted: m }
)
} else {
  await client.sendMessage(
    m.chat,
    {
      text: message.trim(),
      contextInfo: {
        mentionedJid: [owner, m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: canalId,
          serverMessageId: '0',
          newsletterName: canalName,
        },
        externalAdReply: {
          title: botname,
          body: `${botname2}`,
          showAdAttribution: false,
          thumbnailUrl: banner,
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true
        }
      }
    },
    { quoted: m }
  )
}

    
   } catch (e) {
     m.reply(msgglobal)
   }
  }
};