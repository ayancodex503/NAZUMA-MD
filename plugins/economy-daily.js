export default {
  command: ['daily'],
  category: 'rpg',
  run: async (client, m) => {
    const chat = global.db.data.chats[m.chat]
    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const currency = global.db.data.settings[botId].currency

    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const twoDays = oneDay * 2

    if (chat.adminonly || !chat.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    user.dailyStreak ??= 0
    user.lastDaily ??= 0
    user.coins ??= 0

    const timeSinceLast = now - user.lastDaily

    if (timeSinceLast < oneDay) {
      const remaining = formatRemainingTime(oneDay - timeSinceLast)
     return m.reply(
        `✐ You have already claimed your *Daily* today.\n` +
        `> You can claim it again in *${remaining}*`
      ) 
    }

   if (timeSinceLast > twoDays) {
  const lostStreak = user.dailyStreak >= 10
  user.dailyStreak = 1
  user.lastDaily = now
  const reward = calculateReward(user.dailyStreak)
  const next = calculateReward(user.dailyStreak + 1)
  user.coins += reward

  return m.reply(
    `You have claimed your daily reward of *${reward.toLocaleString()} ${currency}! (Day *1*)\n` +
    `> Day *2* » *¥${next.toLocaleString()}*` +
    (lostStreak ? `\n> ☆ You lost your streak!` : '')
  )
}

    user.dailyStreak += 1
    user.lastDaily = now
    const reward = calculateReward(user.dailyStreak)
    const next = calculateReward(user.dailyStreak + 1)
    user.coins += reward

    const streakBonus = user.dailyStreak >= 10
      ? `\n> ☆ *${user.dailyStreak}* day streak! Keep it up!`
      : ''

    await m.reply(
      `You have claimed your daily reward of *¥${reward.toLocaleString()} ${currency}* (Day *${user.dailyStreak}*)\n` +
      `> Day *${user.dailyStreak + 1}* » *¥${next.toLocaleString()}*${streakBonus}`
    )
  },
};

function calculateReward(day) {
  const base = 10000
  const increment = 5000
  const max = 100000
  const reward = base + (day - 1) * increment
  return Math.min(reward, max)
}

function formatRemainingTime(ms) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const parts = []
  if (h) parts.push(`${h} ${h === 1 ? 'hour' : 'hours'}`)
  if (m) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`)
  if (sec || parts.length === 0) parts.push(`${sec} ${sec === 1 ? 'second' : 'seconds'}`)
  return parts.join(' ')
}