import fs from 'fs'

export default {
  command: ['restart'],
  category: 'owner',
  isOwner: true,
  run: async (client, m) => {

    await client.sendMessage(m.chat, {
      text: `
┌───────────────┐
│   🔄 RESTARTING BOT ⚙️   │
└───────────────┘

> Please wait a moment while I restart the system ⚡🤖
      `.trim()
    }, { quoted: m })

    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')

    const botId = client.user.id.split(':')[0]
    fs.writeFileSync(`./tmp/restarting_${botId}.txt`, `${m.chat}|${m.id}`)

    setTimeout(() => {
      process.exit(0)
    }, 3000)
  }
}