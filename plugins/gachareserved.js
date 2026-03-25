import chalk from 'chalk';

const clearReservedCharacters = () => {
  try {
    const chats = global.db.data.chats

    for (const chatId of Object.keys(chats)) {
      const chat = chats[chatId]

      if (!Array.isArray(chat.reservedCharacters)) {
        chat.reservedCharacters = []
      } else {
        chat.reservedCharacters.length = 0
      }
    }

  } catch (e) {
    // console.log(chalk.gray('🍄 Chat Not Defined')) 
  }
}

setInterval(clearReservedCharacters, 1800000)
clearReservedCharacters()