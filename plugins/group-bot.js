export default {
  command: ['bot'],
  category: 'group',
  isAdmin: true,
  run: async (client, m, args) => {
    const chat = global.db.data.chats[m.chat]
    const estado = chat.bannedGrupo ?? false

    if (args[0] === 'off') {
      if (estado) return m.reply(' The *Bot* was already *disabled* in this group.')
      chat.bannedGrupo = true
      return m.reply(` You have *Disabled* *${global.db.data.settings[client.user.id.split(':')[0] + "@s.whatsapp.net"].namebot2}* in this group.`)
    }

    if (args[0] === 'on') {
      if (!estado) return m.reply(` *${global.db.data.settings[client.user.id.split(':')[0] + "@s.whatsapp.net"].namebot2}* was already *enabled* in this group.`)
      chat.bannedGrupo = false
      return m.reply(` You have *Enabled* *${global.db.data.settings[client.user.id.split(':')[0] + "@s.whatsapp.net"].namebot2}* in this group.`)
    }

    return m.reply(
      `*Status of ${global.db.data.settings[client.user.id.split(':')[0] + "@s.whatsapp.net"].namebot2} (｡•́‿•̀｡)*\n✐ *Current ›* ${estado ? '✗ Disabled' : '✓ Enabled'}\n\n✎ You can change it with:\n> ● _Enable ›_ *bot on*\n> ● _Disable ›_ *bot off*`,
    )
  },
};