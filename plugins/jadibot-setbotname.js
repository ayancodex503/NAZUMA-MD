export default {
  command: ['setbotname', 'setname'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...global.owner.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)
    const value = args.join(' ').trim()
    if (!value) return m.reply(`✐ You must enter a valid short and long name.\n> Example: *${prefa}setbotname Queen / Queen Nazuma Mini*`)
    const formatted = value.replace(/\s*\/\s*/g, '/')
    let [short, long] = formatted.includes('/') ? formatted.split('/') : [value, value]
    if (!short || !long) return m.reply('✎ Use the format: Short Name / Long Name')
    if (/\s/.test(short)) return m.reply('The short name cannot contain spaces.')
    config.namebot2 = short.trim()
    config.namebot = long.trim()
    return m.reply(` The bot name has been updated!\n\n❒ Short name: *${short.trim()}*\n❒ Long name: *${long.trim()}*`)
  },
};