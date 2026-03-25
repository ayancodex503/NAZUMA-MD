export default {
  command: ['gid', 'groupid'],
  category: 'info',

  run: async (client, m) => {

    
    if (!m.isGroup) {
      return m.reply('🕷️ This command only works in groups.')
    }

    const groupId = m.chat

    let text = `
🕸️ 𝑮𝑹𝑶𝑼𝑷 𝑰𝑫 🕸️

🕷️ ID:
${groupId}
`.trim()

    await client.sendMessage(
      m.chat,
      { text },
      { quoted: m }
    )
  }
}