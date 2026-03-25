import { resolveLidToRealJid } from "../lib/utils.js"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default {
  command: ['setprimary'],
  category: 'group',
  isAdmin: true,

  run: async (client, m, args) => {
    try {
      const chat = global.db.data.chats[m.chat]
      const mentioned = m.mentionedJid
      const who2 = mentioned.length > 0 ? mentioned[0] : m.quoted?.sender || false
      
      if (!who2) {
        return client.reply(m.chat, `Please mention a bot to set as primary.`, m)
      }

      let resWho = await resolveLidToRealJid(who2, client, m.chat);
      if (!resWho) resWho = who2;
      
      const targetNumber = resWho.split('@')[0].split(':')[0];
      const who = targetNumber + '@s.whatsapp.net';
      
      const mainBotId = client.user.id.split('@')[0].split(':')[0];
      const mainBotJid = mainBotId + '@s.whatsapp.net';
      
      const activeBots = (global.conns || [])
        .filter(conn => conn.user)
        .map(conn => conn.userId.split('@')[0].split(':')[0] + '@s.whatsapp.net')
      
      const allowedBots = [...new Set([mainBotJid, ...activeBots])]

      if (!allowedBots.includes(who)) {
        return client.reply(m.chat, `The mentioned user is not an active Sub-Bot instance.`, m)
      }

      const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(() => null) : null
      if (!groupMetadata) {
        return client.reply(m.chat, `I couldn't get group information. Please try again.`, m)
      }

      const isPresent = groupMetadata.participants.some(p => {
        const pId = (p.id || '').split('@')[0].split(':')[0];
        return pId === targetNumber;
      });

      if (!isPresent) {
        return client.reply(m.chat, `《✧》 The mentioned bot is not present in this group.`, m)
      }

      if (chat.primaryBot === who) {
        return client.reply(m.chat, ` @${targetNumber} is already the Primary Bot of the Group.`, m, {
          mentions: [who],
        })
      }

      chat.primaryBot = who
      await client.reply(
        m.chat,
        ` @${targetNumber} has been set as the primary bot of this group.\n> All commands in this group will now be executed by @${targetNumber}.`,
        m,
        { mentions: [who] },
      )
    } catch (e) {
      console.error(e)
      await m.reply(` An error occurred while trying to set the primary bot.`)
    }
  },
};