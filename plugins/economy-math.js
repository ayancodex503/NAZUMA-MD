import fs from 'fs';

global.math = global.math || {};

const limits = {
  easy: 10,
  medium: 50,
  hard: 90,
  impossible: 100,
  impossible2: 160
};

const generateRandomNumber = (max) => Math.floor(Math.random() * max) + 1;
const getOperation = () => ['+', '-', '×', '÷'][Math.floor(Math.random() * 4)];

const generateProblem = (difficulty) => {
  const maxLimit = limits[difficulty] || 30;
  const num1 = generateRandomNumber(maxLimit);
  const num2 = generateRandomNumber(maxLimit);
  const operator = getOperation();
  const result = eval(`${num1} ${operator === '×' ? '*' : operator} ${num2}`);
  return {
    problem: `${num1} ${operator} ${num2}`,
    result: operator !== '÷' ? result : result.toFixed(2)
  };
};

async function run(client, m, args, command) {
  const chatId = m.chat;
  const db = global.db.data.chats[chatId];
  const user = global.db.data.users[m.sender]
  const game = global.math[chatId];
    if (db.adminonly || !db.rpg)
      return m.reply(`✐ These commands are disabled in this group.`)

  if (command === 'answer') {
    if (!game?.gameActive)
      return // client.reply(chatId, '「✎」No active game. Use *math <difficulty>* to start one.', m);

    const quotedId = m.quoted?.key?.id || m.quoted?.id || m.quoted?.stanzaId;
    if (quotedId !== game.problemMessageId)
      return // client.reply(chatId, '「✎」You must reply to the math problem message.', m);

    const userAnswer = args[0]?.toLowerCase();
    if (!userAnswer)
      return client.reply(chatId, '「✎」You must write your answer. Example: */answer 42*', m);

    const correctAnswer = game.answer;
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const primaryBotId = db.primaryBot;

    if (!primaryBotId || primaryBotId === botId) {
      if (userAnswer === correctAnswer) {
        const randomExp = Math.floor(Math.random() * 50) + 10;
        user.exp = randomExp;

        clearTimeout(game.timeLimit);
        delete global.math[chatId];

        return client.reply(chatId, `「🖤」Correct answer.\n> *You earned ›* ${randomExp} Exp`, m);
      } else {
        game.attempts += 1;
        if (game.attempts >= 3) {
          clearTimeout(game.timeLimit);
          delete global.math[chatId];
          return client.reply(chatId, '「✎」You ran out of attempts. Better luck next time.', m);
        } else {
          const remainingAttempts = 3 - game.attempts;
          return client.reply(chatId, `「✎」Incorrect answer, you have ${remainingAttempts} attempts left.`, m);
        }
      }
    }
    return;
  }

  if (command === 'math') {
    if (game?.gameActive)
      return client.reply(chatId, '🖤 There is already an active game. Wait for it to finish.', m);

    const difficulty = args[0]?.toLowerCase();
    if (!limits[difficulty])
      return client.reply(chatId, '「✎」Specify a valid difficulty: *easy, medium, hard, impossible, impossible2*', m);

    const { problem, result } = generateProblem(difficulty);
    const problemMessage = await client.reply(chatId, `「✩」You have 1 minute to solve:\n\n> ✩ *${problem}*\n\n_✐ Use » *${prefa}answer* to respond!_`, m);

    globalThis.math[chatId] = {
      gameActive: true,
      problem,
      answer: result.toString(),
      attempts: 0,
      timeout: Date.now() + 60000,
      problemMessageId: problemMessage.key?.id,
      timeLimit: setTimeout(() => {
        if (global.math[chatId]?.gameActive) {
          delete globalThis.math[chatId];
          client.reply(chatId, '「🖤」Time is up. The game has ended.', m);
        }
      }, 60000)
    };
  }
}

export default {
  command: ['math', 'answer'],
  category: 'rpg',
  run
};