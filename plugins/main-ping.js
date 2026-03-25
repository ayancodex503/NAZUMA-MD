export default {
  command: ['ping'],
  category: 'info',
  run: async (client, m) => {
    const start = performance.now();
    
    await client.sendMessage(m.chat, { 
      text: `🏓 *Pong!*\n> Time ⏱️ ${(performance.now() - start).toFixed(2)}ms` 
    }, { quoted: m });
  },
};