import chalk from 'chalk'
import moment from 'moment-timezone'

export default async (client, m) => {
  client.ev.on('group-participants.update', async (anu) => {
    try {
      const metadata = await client.groupMetadata(anu.id)
      const chat = global.db.data.chats[anu.id]
      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
      const primaryBotId = chat?.primaryBot

      if (primaryBotId && primaryBotId !== botId) return

      const now = moment().tz('America/Bogota')
      const fecha = now.format('DD MMM YYYY')
      const hora = now.format('hh:mm A')
      const memberCount = metadata.participants.length

      for (const participant of anu.participants) {
        const jid = typeof participant === 'string' ? participant : participant.id

        let userName = jid.split('@')[0]
        try {
          const info = await client.fetchContact(jid)
          if (info?.name) userName = info.name
        } catch {}

        const pp = await client.profilePictureUrl(jid, 'image')
          .catch(() => 'https://files.catbox.moe/28bg4c.jpg')

        const smallThumbContext = {
          contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: global.db.data.settings[botId]?.id || botId,
              serverMessageId: '0',
              newsletterName: global.db.data.settings[botId]?.nameid || 'QUEEN NAZUMA MINI'
            },
            externalAdReply: {
              title: global.db.data.settings[botId]?.namebot || 'QUEEN NAZUMA MINI',
              body: global.dev || 'Automatic Notification',
              mediaUrl: null,
              description: null,
              previewType: 'PHOTO',
              thumbnailUrl: global.db.data.settings[botId]?.icon || pp,
              sourceUrl: global.db.data.settings[botId]?.link || 'https://github.com/ayancodex503/QUEEN-NAZUMA-MINI',
              mediaType: 1,
              renderLargerThumbnail: false 
            },
            mentionedJid: [jid]
          }
        }

        const normalThumbContext = {
          contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: global.db.data.settings[botId]?.id || botId,
              serverMessageId: '0',
              newsletterName: global.db.data.settings[botId]?.nameid || 'QUEEN NAZUMA MINI'
            },
            externalAdReply: {
              title: global.db.data.settings[botId]?.namebot || 'QUEEN NAZUMA MINI',
              body: global.dev || 'Automatic Notification',
              mediaUrl: null,
              description: null,
              previewType: 'PHOTO',
              thumbnailUrl: global.db.data.settings[botId]?.icon || pp,
              sourceUrl: global.db.data.settings[botId]?.link || 'https://github.com/ayancodex503/QUEEN-NAZUMA-MINI',
              mediaType: 1,
              renderLargerThumbnail: true
            },
            mentionedJid: [jid]
          }
        }

        switch (anu.action) {
          case 'add':
            if (chat?.welcome) {
              const welcomeMessage = `
╔═══❖•°•°•°❖•°•°•°❖═══╗
       🌟 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🌟
╚═══❖•°•°•°❖•°•°•°❖═══╝

✨ @${userName} joined the group
📌 ${metadata.subject}

📅 ${fecha} | 🕐 ${hora}
👥 Members: ${memberCount}

💡 Use .menu to see available commands
🎯 Enjoy your stay!

╰─⊷ ${global.db.data.settings[botId]?.namebot || 'QUEEN NAZUMA MINI'} ⊶─╯`

              await client.sendMessage(anu.id, { 
                image: { url: pp }, 
                caption: welcomeMessage, 
                mentions: [jid],
                ...smallThumbContext
              })
            }
            break

          case 'remove':
          case 'leave':
            if (chat?.welcome) {
              const goodbyeMessage = `
╔═══❖•°•°•°❖•°•°•°❖═══╗
       🕊️  𝐆𝐎𝐎𝐃𝐁𝐘𝐄  🕊️
╚═══❖•°•°•°❖•°•°•°❖═══╝

👤 @${userName} left the group

📅 ${fecha} | 🕐 ${hora}
👥 Remaining members: ${memberCount}

🎐 Hope to see you again soon
📝 Your contributions were valued

╰─⊷ ${global.db.data.settings[botId]?.namebot || 'QUEEN NAZUMA MINI'} ⊶─╯`

              await client.sendMessage(anu.id, { 
                image: { url: pp }, 
                caption: goodbyeMessage, 
                mentions: [jid],
                ...smallThumbContext 
              })
            }
            break

          case 'promote':
          case 'demote':
            if (chat?.alerts) {
              const adminJid = anu.author
              let adminName = adminJid.split('@')[0]
              try {
                const info = await client.fetchContact(adminJid)
                if (info?.name) adminName = info.name
              } catch {}

              const action = anu.action === 'promote' ? 'has been promoted' : 'has been demoted'
              const actionTitle = anu.action === 'promote' ? '⚡ 𝐍𝐄𝐖 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐓𝐎𝐑 ⚡' : '📉 𝐑𝐎𝐋𝐄 𝐂𝐇𝐀𝐍𝐆𝐄 📉'

              const msg = `
╭─────────────────╮
   ${actionTitle}
╰─────────────────╯

👑 @${userName} ${action}
👤 By: @${adminName}

📋 ${anu.action === 'promote' ? 'Now has administrator privileges\n🛡️ Responsibilities assigned' : 'Administrator privileges removed\n⚙️ Role changed to regular member'}

╰─⊷ ${fecha} ${hora} ⊶─╯`

              await client.sendMessage(anu.id, {
                text: msg,
                mentions: [jid, adminJid],
                ...normalThumbContext
              })
            }
            break
        }
      }
    } catch (error) {
      console.error(chalk.red(`[ERROR] Group Participants Update → ${error.message}`))
      console.error(chalk.gray(`Stack: ${error.stack}`))
    }
  })
}