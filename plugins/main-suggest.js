export default {
  command: ['report'],
  category: 'info',
  run: async (client, m, args) => {

    const texto = args.join(' ').trim()
    const now = Date.now()

    const cmd = m.text.split(' ')[0].replace(/^\/|^\!|^\./, '').toLowerCase()

    const cooldown = global.db.data.users[m.sender].sugCooldown || 0
    const remaining = cooldown - now

    if (remaining > 0) {
      return m.reply(`
┌───────────────┐
│  ⏳ COOLDOWN ACTIVE  │
└───────────────┘

Time remaining:
→ ${msToTime(remaining)}
      `.trim())
    }

    if (!texto || texto.length < 10) {
      return m.reply(`
┌───────────────┐
│   ⚠️ INVALID INPUT │
└───────────────┘

Your message must be at least 10 characters long.
      `.trim())
    }

    let type = 'Suggestion'
    if (cmd === 'report' || cmd === 'reporte') type = 'Report'

    const user = m.pushName || 'Unknown user'
    const number = m.sender.split('@')[0]

    const date = new Date()
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const localDate = date.toLocaleDateString('en-US', options)

    const pp = await client.profilePictureUrl(m.sender, 'image')
      .catch(() => 'https://files.catbox.moe/28bg4c.jpg')

    const reportMsg = `
┌───────────────┐
│  ${type.toUpperCase()}  │
└───────────────┘

User:
→ ${user}

Contact:
→ wa.me/${number}

Date:
→ ${localDate}

Message:
→ ${texto.split('\n').join('\n→ ')}
    `.trim()

    await global.client.sendContextInfoIndex(
      '120363424651881923@g.us',
      reportMsg,
      {},
      null,
      false,
      null,
      {
        banner: pp,
        title: type,
        body: 'Message sent to staff',
        redes: global.db.data.settings[
          client.user.id.split(':')[0] + '@s.whatsapp.net'
        ].link
      }
    )

    global.db.data.users[m.sender].sugCooldown = now + 30 * 1000

    await m.reply(`
┌───────────────┐
│   ✅ SENT OK │
└───────────────┘

*Your ${type.toLowerCase()} was sent successfully to the team.*\n> Thank you for your contribution.
    `.trim())
  }
}

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)
  return parts.join(' ')
}