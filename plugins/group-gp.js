import ws from 'ws';
import fs from 'fs';

export default {
  command: ['gp', 'groupinfo'],
  category: 'group',
  run: async (client, m, args) => {
    const from = m.chat
    const groupMetadata = m.isGroup ? await client.groupMetadata(from).catch((e) => {}) : ''
    const groupName = groupMetadata.subject;
    const groupCreator = groupMetadata.owner ? '@' + groupMetadata.owner.split('@')[0] : 'Unknown';

    const totalParticipants = groupMetadata.participants.length;
    const chatId = m.chat;
    const chat = global.db.data.chats[chatId] || {};
    const chatUsers = chat.users || {};

    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net";
    const botSettings = global.db.data.settings[botId];

    const botname = botSettings.namebot2;
    const currency = botSettings.currency;

    let totalCoins = 0;
    let registeredUsersInGroup = 0;
    let totalClaimedWaifus = 0;

const resolvedUsers = await Promise.all(
  groupMetadata.participants.map(async (participant) => {
    return { ...participant, phoneNumber: participant.phoneNumber, jid: participant.jid };
  })
);

    resolvedUsers.forEach((participant) => {
  const fullId = participant.phoneNumber || participant.jid || participant.id;
  const user = chatUsers[fullId];
  if (user) {
    registeredUsersInGroup++;
    totalCoins += Number(user.coins) || 0;
    const characters = Array.isArray(user.characters) ? user.characters : [];
    totalClaimedWaifus += characters.length;
  }
});

    const rawPrimary = typeof chat.primaryBot === 'string' ? chat.primaryBot : '';
    const botprimary = rawPrimary.endsWith('@s.whatsapp.net')
      ? `@${rawPrimary.split('@')[0]}`
      : 'Random';

    const settings = {
      bot: chat.bannedGrupo ? '✘ Disabled' : '✓ Enabled',
      antiLinks: chat.antilinks ? '✓ Enabled' : '✘ Disabled',
      welcomes: chat.welcome ? '✓ Enabled' : '✘ Disabled',
      alerts: chat.alerts ? '✓ Enabled' : '✘ Disabled',
      gacha: chat.gacha ? '✓ Enabled' : '✘ Disabled',
      rpg: chat.rpg ? '✓ Enabled' : '✘ Disabled',
      nsfw: chat.nsfw ? '✓ Enabled' : '✘ Disabled',
      adminMode: chat.adminonly ? '✓ Enabled' : '✘ Disabled',
      botprimary: botprimary
    };

    try {
      let message = `*「✿」Group ◢ ${groupName} ◤*\n\n`;
      message += `➪ *Creator ›* ${groupCreator}\n`;
      message += `❖ Primary Bot › *${settings.botprimary}*\n`;
      message += `❒ Users › *${totalParticipants}*\n`;
      message += `ꕥ Registered › *${registeredUsersInGroup}*\n`;
      message += `✿ Claims › *${totalClaimedWaifus}*\n`;
      message += `⛁ Money › *${totalCoins.toLocaleString()} ${currency}*\n\n`;
      message += `➪ *Settings:*\n`;
      message += `✐ ${botname} › *${settings.bot}*\n`;
      message += `✐ AntiLinks › *${settings.antiLinks}*\n`;
      message += `✐ Welcomes › *${settings.welcomes}*\n`;
      message += `✐ Alerts › *${settings.alerts}*\n`;
      message += `✐ Gacha › *${settings.gacha}*\n`;
      message += `✐ Economy › *${settings.rpg}*\n`;
      message += `✐ Nsfw › *${settings.nsfw}*\n`;
      message += `✐ AdminOnly › *${settings.adminMode}*`;

      const mentionOw = groupMetadata.owner ? groupMetadata.owner : '';
      const mentions = [rawPrimary, mentionOw].filter(Boolean);

      await client.reply(m.chat, message.trim(), m, { mentions });
    } catch (e) {
      await m.reply(msgglobal);
    }
  }
};