export default {
  command: [
    'welcome',
    'alerts',
    'nsfw',
    'antilink', 'antilinks',
    'rpg', 'economy',
    'gacha',
    'adminonly'
  ],
  category: 'group',
  isAdmin: true,
  run: async (client, m, args, command) => {
    const chatData = global.db.data.chats[m.chat]
    const stateArg = args[0]?.toLowerCase()
    const validStates = ['on', 'off', 'enable', 'disable']

    const mapTerms = {
      antilinks: 'antilinks',
      antilink: 'antilinks',
      welcome: 'welcome',
      alerts: 'alerts',
      economy: 'rpg',
      rpg: 'rpg',
      adminonly: 'adminonly',
      nsfw: 'nsfw',
      gacha: 'gacha'
    }

    const featureNames = {
      antilinks: '*AntiLink*',
      welcome: '*Welcome* message',
      alerts: '*Alerts*',
      rpg: '*Economy* commands',
      gacha: '*Gacha* commands',
      adminonly: '*AdminOnly* mode',
      nsfw: '*NSFW* commands'
    }

    const featureTitles = {
      antilinks: 'AntiLink',
      welcome: 'Welcome',
      alerts: 'Alerts',
      rpg: 'Economy',
      gacha: 'Gacha',
      adminonly: 'AdminOnly',
      nsfw: 'NSFW'
    }

    const normalizedKey = mapTerms[command] || command
    const current = chatData[normalizedKey] === true
    const estado = current ? '✓ Enabled' : '✗ Disabled'
    const niceName = featureNames[normalizedKey] || `*${normalizedKey}*`
    const title = featureTitles[normalizedKey] || normalizedKey

    if (!stateArg) {
      return client.reply(
        m.chat,
        `*✩ ${title} (✿❛◡❛)*\n` +
        `❒ *Status ›* ${estado}\n\n` +
        `ꕥ An admin can enable or disable ${niceName} using:\n\n` +
        `> ● _Enable ›_ *${prefa + normalizedKey} enable*\n` +
        `> ● _Disable ›_ *${prefa + normalizedKey} disable*\n\n${dev}`,
        m
      )
    }

    if (!validStates.includes(stateArg)) {
      return m.reply(
        `✎ Invalid status. Use *on*, *off*, *enable* or *disable*\n\nExample:\n${prefa}${normalizedKey} enable`
      )
    }

    const enabled = ['on', 'enable'].includes(stateArg)

    if (chatData[normalizedKey] === enabled) {
      return m.reply(`✎ *${title}* was already *${enabled ? 'enabled' : 'disabled'}*.`)
    }

    chatData[normalizedKey] = enabled
    return m.reply(`✎ You have *${enabled ? 'enabled' : 'disabled'}* ${niceName}.`)
  }
};