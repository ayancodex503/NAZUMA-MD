export default {
  command: ['setchannel', 'setbotchannel'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...global.owner.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)
    const value = args.join(' ').trim()
    if (!value) {
      return m.reply(`Enter a WhatsApp channel link or ID.\n\nExamples:\n*${client.prefix}setchannel* https://whatsapp.com/channel/XXXXXXXXXXXXXX\n*${client.prefix}setchannel* 12345@newsletter`)
    }
    let info, ch
    if (/@newsletter$/i.test(value)) {
      ch = value.trim()
      info = await client.newsletterMetadata("jid", ch)
    } else {
      const channelUrl = value.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:channel\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
      if (!channelUrl) return m.reply('The provided link or ID is invalid.')
      info = await client.newsletterMetadata("invite", channelUrl)
      ch = info?.id
    }
    if (!info) return m.reply('Could not get channel information.')
    config.id = info.id
    config.nameid = info.thread_metadata.name.text || "Channel without name"
    return m.reply(` The Socket channel has been changed to *"${config.nameid}"* successfully.`)
  },
};