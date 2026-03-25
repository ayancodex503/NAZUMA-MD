export default {
  command: ['setbirth'],
  category: 'profile',
  run: async (client, m, args) => {
    const user = global.db.data.users[m.sender]
    const currentYear = new Date().getFullYear()
    const input = args.join(' ')

    if (user.birth)
      return m.reply(
        `You already have a date set. Use › *${prefa}delbirth* to remove it.`,
      )

    if (!input)
      return m.reply(
        'You must enter a valid date.\n\n`Example`' +
          `\n${prefa}setbirth *01/01/2000*\n${prefa}setbirth *01/01*`,
      )

    const birth = validateBirthDate(input, currentYear, 'setbirth')
    if (!birth || birth.includes('Year cannot be greater'))
      return m.reply(birth || `Invalid date. Use › *${prefa}setbirth 01/01/2000*`)

    user.birth = birth
    return m.reply(`✎ Your birth date has been set to: *${user.birth}*`)
  },
};

function validateBirthDate(text, currentYear, command) {
  const formats = [
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    /^\d{1,2}\/\d{1,2}$/,
    /^\d{1,2} \w+$/,
    /^\d{1,2} \w+ \d{4}$/,
  ]
  if (!formats.some((r) => r.test(text))) return null

  let day, month, year
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)) {
    ;[day, month, year] = text.split('/').map(Number)
  } else if (/^\d{1,2}\/\d{1,2}$/.test(text)) {
    ;[day, month] = text.split('/').map(Number)
    year = currentYear
  } else {
    const parts = text.split(' ')
    day = parseInt(parts[0])
    month = new Date(`${parts[1]} 1`).getMonth() + 1
    year = parts[2] ? parseInt(parts[2]) : currentYear
  }

  if (year > currentYear)
    return `✦ Year cannot be greater than ${currentYear}. Example: ${prefa}setbirth 01/12/${currentYear}`

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const daysPerMonth = [
    31,
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ]

  while (day > daysPerMonth[month - 1]) {
    day -= daysPerMonth[month - 1]
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }

  const date = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
  const dayOfWeek = daysOfWeek[date.getUTCDay()]
  return `${dayOfWeek}, ${day} of ${months[month - 1]}`
}