import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function reloadCommands() {
  const commandsMap = new Map();
  const pluginsPath = path.join(__dirname, '../plugins');
  
  if (!fs.existsSync(pluginsPath)) {
    console.log('Plugins directory not found');
    return;
  }

  const files = fs.readdirSync(pluginsPath);

  for (const file of files) {
    if (file.endsWith('.js')) {
      const fullPath = path.join(pluginsPath, file);
      try {
        // Clear cache and reload module
        delete require.cache[require.resolve(fullPath)];
        const { default: cmd } = await import(`file://${fullPath}?update=${Date.now()}`);
        
        if (cmd?.command && Array.isArray(cmd.command)) {
          cmd.command.forEach((c) => {
            commandsMap.set(c.toLowerCase(), cmd);
          });
        }
      } catch (err) {
        console.error(`Error loading ${file}:`, err.message);
      }
    }
  }

  global.comandos = commandsMap;
  console.log(`✅ Reloaded ${commandsMap.size} commands`);
}

async function getGitInfo() {
  try {
    const { stdout: branch } = await execPromise('git branch --show-current');
    const { stdout: commit } = await execPromise('git rev-parse --short HEAD');
    const { stdout: lastCommit } = await execPromise('git log -1 --format=%s');
    return {
      branch: branch.trim(),
      commit: commit.trim(),
      lastCommit: lastCommit.trim()
    };
  } catch {
    return null;
  }
}

export default {
  command: ['update', 'upgrade', 'gitpull'],
  category: 'owner',
  isOwner: true,
  run: async (client, m) => {
    try {
      // Check if git is installed
      try {
        execSync('git --version', { stdio: 'ignore' });
      } catch {
        return m.reply('❌ *Git is not installed on this system.*\n> Cannot perform update.');
      }

      // Check if it's a git repository
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        return m.reply('❌ *Not a git repository.*\n> Please clone the repository first:\n> `git clone https://github.com/ayancodex503/QUEEN-NAZUMA-MINI.git`');
      }

      const beforeInfo = await getGitInfo();
      
      await client.sendMessage(m.chat, {
        text: '🔄 *QUEEN NAZUMA MINI:* \n> Checking for updates...'
      }, { quoted: m });

      // Fetch latest changes
      const { stdout: fetchOutput, stderr: fetchError } = await execPromise('git fetch origin');
      
      if (fetchError && !fetchOutput) {
        return m.reply(`❌ *Error fetching updates:*\n\`\`\`${fetchError}\`\`\``);
      }

      // Check if there are updates
      const { stdout: statusOutput } = await execPromise('git status -sb');
      const isBehind = statusOutput.includes('[behind');

      if (!isBehind) {
        // Still reload commands in case something changed
        await reloadCommands();
        
        const currentInfo = await getGitInfo();
        return m.reply(`✅ *QUEEN NAZUMA MINI is up to date!*\n\n` +
          `📌 *Branch:* ${currentInfo?.branch || 'main'}\n` +
          `🔖 *Commit:* ${currentInfo?.commit || 'unknown'}\n` +
          `📝 *Last update:* ${currentInfo?.lastCommit || 'unknown'}\n\n` +
          `> Commands have been refreshed.`);
      }

      // Get update info
      const { stdout: logOutput } = await execPromise('git log --oneline HEAD..origin/HEAD --format="%s" | head -5');
      const updates = logOutput.trim().split('\n').filter(Boolean);

      await client.sendMessage(m.chat, {
        text: `📦 *Updates found!*\n\n` +
          updates.map(u => `• ${u}`).join('\n') +
          `\n\n> 🔄 Pulling changes...`
      }, { quoted: m });

      // Pull latest changes
      const { stdout: pullOutput, stderr: pullError } = await execPromise('git pull origin');

      if (pullError && !pullOutput) {
        return m.reply(`❌ *Error pulling updates:*\n\`\`\`${pullError}\`\`\``);
      }

      // Reload commands after update
      await reloadCommands();

      const afterInfo = await getGitInfo();

      // Check if restart is needed
      const needsRestart = pullOutput.includes('changed') || pullOutput.includes('file');

      const successMessage = `🚀 *QUEEN NAZUMA MINI updated successfully!*\n\n` +
        `📌 *Branch:* ${afterInfo?.branch || 'main'}\n` +
        `🔖 *Commit:* ${afterInfo?.commit || 'unknown'} (was ${beforeInfo?.commit || 'unknown'})\n` +
        `📦 *Files updated:* ${pullOutput.split('\n').filter(l => l.includes('|')).length}\n\n` +
        `📝 *Changes:*\n${updates.slice(0, 3).map(u => `• ${u}`).join('\n')}`;

      await client.sendMessage(m.chat, {
        text: successMessage
      }, { quoted: m });

      // Restart if needed
      if (needsRestart) {
        await client.sendMessage(m.chat, {
          text: '🔄 *Restarting bot...*\n> Please wait a moment while I restart the system ⚡🤖'
        }, { quoted: m });

        const botId = client.user.id.split(':')[0];
        if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
        fs.writeFileSync(`./tmp/restarting_${botId}.txt`, `${m.chat}|${m.id}`);

        setTimeout(() => {
          process.exit(0);
        }, 3000);
      } else {
        await client.sendMessage(m.chat, {
          text: '✅ *Update completed!*\n> Commands have been reloaded. No restart needed.'
        }, { quoted: m });
      }

    } catch (error) {
      console.error('Update error:', error);
      await m.reply(`❌ *Update failed:*\n\`\`\`${error.message}\`\`\`\n> Please check your internet connection and try again.`);
    }
  }
};