import { startSubBot } from '../lib/subs.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

let commandFlags = {}

export default {
  command: ['pair', 'code'],
  category: 'socket',

  run: async (client, m, args, command) => {

    const subsPath = path.join(dirname, '../../Sessions/Subs')
    const subsCount = fs.existsSync(subsPath)
      ? fs.readdirSync(subsPath).filter((dir) => {
          const credsPath = path.join(subsPath, dir, 'creds.json')
          return fs.existsSync(credsPath)
        }).length
      : 0

    if (subsCount >= 20) {
      return client.reply(m.chat, '⚠️ *SYSTEM SATURATED*\nSorry, all linking slots are currently occupied. Try again later.', m)
    }

    commandFlags[m.sender] = true

    const rtx = `✨ *GET READY FOR LINKING!* ✨
    
  *Follow these steps carefully:*
  ──────────────────────────
  1️⃣  Open *WhatsApp* on your other device.
  2️⃣  Tap the menu (⋮) or *Settings*.
  3️⃣  Go to *Linked Devices*.
  4️⃣  Select *Link with phone number*.
  ──────────────────────────
  
  📩 *CODE ON THE WAY...*
  The 8-digit code will appear right below this message.
  
  🛡️ _Security: The code is for one-time use and only for your number._`

    const phone = args[0] ? args[0].replace(/\D/g, '') : m.sender.split('@')[0]
    
    await client.sendMessage(m.chat, { 
        text: rtx 
    }, { quoted: m })

    await startSubBot(m, client, null, true, phone, m.chat, commandFlags, true)
    
    global.db.data.users[m.sender].Subs = new Date() * 1
  }
};