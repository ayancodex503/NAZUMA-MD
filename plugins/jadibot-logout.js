import fs from 'fs';
import path from 'path';
import {jidDecode} from '@whiskeysockets/baileys';

export default {
  command: ['logout'],
  category: 'socket',
  run: async (client, m, { prefa, msgglobal }) => {
    const rawId = client.user?.id || ''
    const decoded = jidDecode(rawId)
    const cleanId = decoded?.user || rawId.split('@')[0]

    const sessionTypes = ['Subs', 'Mods', 'Prems']
    const basePath = 'Sessions'
    const sessionPath = sessionTypes
      .map((type) => path.join(basePath, type, cleanId))
      .find((p) => fs.existsSync(p))

    if (!sessionPath) {
      return m.reply(' This command can only be used from a Sub-Bot instance.')
    }

    try {
      await m.reply(' Logging out Socket...')
      await client.logout()

      setTimeout(() => {
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true })
          console.log(` Session for ${cleanId} deleted from ${sessionPath}`)
        }
      }, 2000)

      setTimeout(() => {
        m.reply(` Session ended successfully.\nYou can reconnect using *${prefa}code*`)
      }, 3000)
    } catch (err) {
      await m.reply(msgglobal)
    }
  },
};