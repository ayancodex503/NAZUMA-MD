export default {
  command: ['self'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [
      idBot,
      ...globalThis.owner.map((number) => number + '@s.whatsapp.net'),
    ].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) {
      return m.reply(mess.socket)
    }
    const chat = global.db.data.settings[client.user.id.split(':')[0] + '@s.whatsapp.net']
    const estado = chat.self ?? false

    if (args[0] === 'enable' || args[0] === 'on') {
      if (estado) return m.reply(' *Self* mode was already enabled.')
      chat.self = true
      return m.reply('You *Enabled* *Self* mode.')
    }

    if (args[0] === 'disable' || args[0] === 'off') {
      if (!estado) return m.reply(' *Self* mode was already disabled.')
      chat.self = false
      return m.reply('You *Disabled* *Private* mode.')
    }

    return m.reply(
      `*☆ Self (✿❛◡❛)*\n➮ *Status ›* ${estado ? '✓ Enabled' : '✗ Disabled'}\n\n You can change it with:\n> ● *Enable ›* *self enable*\n> ● *Disable ›* *self disable*`,
    )
  },
};