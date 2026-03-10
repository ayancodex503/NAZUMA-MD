// NAZUMA CODEX 2026-2030
var commands = [];

function cmd(info, func) {
    var data = info;
    data.function = func;
    
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!info.desc) info.desc = 'sem descrição';
    if (!data.fromMe) data.fromMe = false;
    if (!info.category) data.category = 'tools';
    if (!info.filename) data.filename = "sem arquivo";
    if (!info.react) info.react = '';
    if (!info.alias) info.alias = [];
    
    commands.push(data);
    return data;
}

// categorias de comandos
const categories = {
    'ai': { emoji: '🤖', name: 'ƛƖ ƇƠMMƛƝƊƧ' },
    'download': { emoji: '📥', name: 'ƊƠƜƝԼƠƛƊ ƇƠMMƛƝƊƧ' },
    'search': { emoji: '🔍', name: 'ƧЄƛƦƇӇ ƇƠMMƛƝƊƧ' },
    'owner': { emoji: '👑', name: 'ƠƜƝЄƦ ƇƠMMƛƝƊƧ' },
    'convert': { emoji: '⚙️', name: 'ƇƠƝƔЄƦƬ ƇƠMMƛƝƊƧ' },
    'group': { emoji: '👥', name: 'ƓƦƠƲƤ ƇƠMMƛƝƊƧ' },
    'other': { emoji: '🌐', name: 'ƠƬӇЄƦ ƇƠMMƛƝƊƧ' },
    'news': { emoji: '📄', name: 'ƝЄƜƧ ƇƠMMƛƝƊƧ' },
    'tools': { emoji: '🛠️', name: 'ƬƠƠԼƧ ƇƠMMƛƝƊƧ' },
    'anime': { emoji: '🔥', name: 'ƛƝƖMЄ ƇƠMMƛƝƊƧ' },
    'main': { emoji: '🤖', name: 'MƛƖƝ ƇƠMMƛƝƊƧ' },
    'youtube': { emoji: '📺', name: 'ƳƠƲƬƲƁЄ ƇƠMMƛƝƊƧ' }
};

// gerar menu dinâmico
function generateDynamicMenu(prefix) {
    let categorizedCommands = {};
    
    for (let cmd of commands) {
        if (cmd.dontAddCommandList) continue;
        
        const category = cmd.category.toLowerCase();
        if (!categorizedCommands[category]) {
            categorizedCommands[category] = [];
        }
        
        categorizedCommands[category].push({
            title: cmd.pattern.split('|')[0],
            description: cmd.desc,
            id: `${prefix}${cmd.pattern.split('|')[0]}`
        });
    }

    const sections = [];
    
    for (let categoryKey in categories) {
        if (categorizedCommands[categoryKey] && categorizedCommands[categoryKey].length > 0) {
            sections.push({
                title: `${categories[categoryKey].emoji} ${categories[categoryKey].name}`,
                highlight_label: `${categorizedCommands[categoryKey].length} comandos`,
                rows: categorizedCommands[categoryKey].slice(0, 10)
            });
        }
    }

    return sections;
}

// gerar texto do menu
function generateMenuText(prefix, userInfo = {}, language = 'en') {
    const texts = {
        en: {
            title: "ƝƛȤƲMƛ MƊ",
            user: "👤 user",
            name: "👤 name", 
            prefix: "🔯 prefix",
            commands: "📡 commands",
            owner: "👑 owner",
            version: "🌐 version",
            select: "🤖 select a category to view commands:",
            developed: "> developed by ayan codex"
        },
        es: {
            title: "ƝƛȤƲMƛ MƊ",
            user: "👤 usuario",
            name: "👤 nombre",
            prefix: "🔯 prefijo",
            commands: "📡 comandos",
            owner: "👑 propietario",
            version: "🌐 versión",
            select: "🤖 selecciona una categoría:",
            developed: "> desarrollado por ayan codex"
        },
        pt: {
            title: "ƝƛȤƲMƛ MƊ",
            user: "👤 usuário",
            name: "👤 nome",
            prefix: "🔯 prefixo",
            commands: "📡 comandos",
            owner: "👑 dono",
            version: "🌐 versão",
            select: "🤖 selecione uma categoria para ver os comandos:",
            developed: "> desenvolvido por ayan codex"
        }
    };
    
    const langTexts = texts[language] || texts['en'];
    
    let menuText = `╭───────────────────── • ◕ • ─────────────────────╮\n`;
    menuText += `                *${langTexts.title}*  🪀\n`;
    
    if (userInfo.username) {
        menuText += `┃ ${langTexts.user} : @${userInfo.username}\n`;
    }
    if (userInfo.pushname) {
        menuText += `┃ ${langTexts.name} : ${userInfo.pushname}\n`;
    }
    
    menuText += `┃ ${langTexts.prefix} : [${prefix}]\n`;
    menuText += `┃ ${langTexts.commands} : ${commands.filter(cmd => !cmd.dontAddCommandList).length}\n`;
    menuText += `┃ ${langTexts.owner} : ƛƳƛƝ ƇƠƊЄҲ\n`;
    menuText += `┃ ${langTexts.version} : 1.0.0\n`;
    menuText += `┃ ─────────────────────────────────────────\n`;
    menuText += `╰───────────────────── • ◕ • ─────────────────────╯\n\n`;
    menuText += `${langTexts.select}\n\n`;
    menuText += `${langTexts.developed}`;

    return menuText;
}

// exportar módulos
module.exports = {
    cmd,
    AddCommand: cmd,
    Function: cmd,
    Module: cmd,
    commands,
    categories,
    generateDynamicMenu,
    generateMenuText
};