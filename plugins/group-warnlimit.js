export default {
  command: ['setwarnlimit'],
  category: 'group',
  isAdmin: true,
  run: async (client, m, args) => {
    const chat = global.db.data.chats[m.chat]
    const raw = args[0]
    const limit = parseInt(raw)

    if (isNaN(limit) || limit < 0 || limit > 10) {
      return m.reply(
        `✐ The warning limit must be a number between \`1\` and \`10\`, or \`0\` to disable.\n` +
        `> Example 1 › *${prefa}setwarnlimit 5*\n` +
        `> Example 2 › *${prefa}setwarnlimit 0*\n\n` +
        `> Using \`0\` will disable the feature that removes users when reaching the warning limit.\n` +
        `❖ Current status: ${chat.expulsar ? `\`${chat.warnLimit}\` warnings` : '`Disabled`'}`
      )
    }

    if (limit === 0) {
      chat.warnLimit = 0
      chat.expulsar = false
      return m.reply(
        `✐ You have disabled the feature that removes users when reaching the warning limit.`
      )
    }

    chat.warnLimit = limit
    chat.expulsar = true

    await m.reply(
      `✐ Warning limit set to \`${limit}\` for this group.\n` +
      `> Users will be automatically removed when reaching this limit.`
    )
  },
};