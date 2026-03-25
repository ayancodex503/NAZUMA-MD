import fs from 'fs';
import os from 'os';

function getDefaultHostId() {
  if (process.env.HOSTNAME) {
    return process.env.HOSTNAME.split('-')[0]
  }
  return 'default_host_id'
}

export default {
  command: ['status'],
  description: 'Shows bot and server status.',
  category: 'info',
  run: async (client, m) => {

    const hostId = getDefaultHostId()
    const registeredGroups = global.db.data.chats ? Object.keys(global.db.data.chats).length : 0
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net" || false
    const botSettings = global.db.data.settings[botId] || {}

    const botname = botSettings.namebot || 'QUEEN NAZUMA MINI'
    const botname2 = botSettings.namebot2 || 'QUEEN NAZUMA'
    const userCount = Object.keys(global.db.data.users).length || '0'

    const botStatus = 
`「❀」 Status of *QUEEN NAZUMA MINI* (●\´ϖ\`●)
✎ *Registered users ›* ${userCount.toLocaleString()}
✎ *Registered groups ›* ${registeredGroups.toLocaleString()}`

    const system = os.type()
    const cpu = os.cpus().length
    const ramTotal = (os.totalmem() / 1024 ** 3).toFixed(2)
    const ramUsed = ((os.totalmem() - os.freemem()) / 1024 ** 3).toFixed(2)
    const architecture = os.arch()

    const serverStatus = 
`➭ Server Status *₍ᐢ..ᐢ₎♡*

> *System ›* ${system}
> *CPU ›* ${cpu} cores
> *RAM ›* ${ramTotal} GB
> *RAM Used ›* ${ramUsed} GB
> *Architecture ›* ${architecture}
> *Host ID ›* ${hostId}`

    const message = `${botStatus}\n\n${serverStatus}`

    await client.reply(m.chat, message, m)
  }
};