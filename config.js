/**
 * NAZUMA MD - Professional Configuration File
 * @version 2.0.0
 * @author AYAN CODEX
 * @license MIT
 * @copyright 2026-2030 NAZUMA CODEX
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from config.env if it exists
if (fs.existsSync(path.join(__dirname, 'config.env'))) {
    require('dotenv').config({ path: './config.env' });
}

/**
 * Convert string to boolean
 * @param {string} text - The text to convert
 * @param {string} fault - The value that represents true
 * @returns {boolean}
 */
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

/**
 * NAZUMA MD Configuration
 * All settings can be overridden via environment variables
 */
const config = {
    // =============================================
    // SESSION CONFIGURATION
    // =============================================
    session: {
        id: process.env.SESSION_ID || "YOUR_SESSION_ID",
    },

    // =============================================
    // STATUS FEATURES
    // =============================================
    status: {
        autoSeen: process.env.AUTO_STATUS_SEEN || "true",
        autoReply: process.env.AUTO_STATUS_REPLY || "true",
        autoReact: process.env.AUTO_STATUS_REACT || "true",
        autoMessage: process.env.AUTO_STATUS_MSG || "*SEEN YOUR STATUS BY ƝƛȤƲMƛ MƊ🤍*",
    },

    // =============================================
    // GROUP FEATURES
    // =============================================
    group: {
        welcome: process.env.WELCOME || "true",
        adminEvents: process.env.ADMIN_EVENTS || "true",
    },

    // =============================================
    // ANTI-FEATURES (Security)
    // =============================================
    anti: {
        link: process.env.ANTI_LINK || "true",
        linkKick: process.env.ANTI_LINK_KICK || "true",
        badWord: process.env.ANTI_BAD || "true",
        delete: process.env.ANTI_DELETE || "true",
        call: process.env.ANTI_CALL || "true",
        viewOnce: process.env.ANTI_VV || "true",
        deleteLinks: process.env.DELETE_LINKS || "true",
        deletePath: process.env.ANTI_DEL_PATH || "log",
    },

    // =============================================
    // AUTO FEATURES
    // =============================================
    auto: {
        typing: process.env.AUTO_TYPING || "true",
        recording: process.env.AUTO_RECORDING || "true",
        reply: process.env.AUTO_REPLY || "true",
        voice: process.env.AUTO_VOICE || "true",
        sticker: process.env.AUTO_STICKER || "true",
        react: process.env.AUTO_REACT || "false",
        alwaysOnline: process.env.ALWAYS_ONLINE || "false",
    },

    // =============================================
    // REPLY FEATURES
    // =============================================
    reply: {
        mention: process.env.MENTION_REPLY || "false",
        readMessage: process.env.READ_MESSAGE || "false",
        readCommand: process.env.READ_CMD || "false",
    },

    // =============================================
    // REACTION FEATURES
    // =============================================
    reaction: {
        custom: process.env.CUSTOM_REACT || "false",
        customEmojis: process.env.CUSTOM_REACT_EMOJIS || "👍,❤️,😂,😮,😢,🙏,🥲,🙂,😔",
        heart: process.env.HEART_REACT || "false",
    },

    // =============================================
    // BOT CONFIGURATION
    // =============================================
    bot: {
        prefix: process.env.PREFIX || ".",
        mode: process.env.MODE || "public",
        publicMode: process.env.PUBLIC_MODE || "true",
        name: process.env.BOT_NAME || "ƝƛȤƲMƛ MƊ",
        stickerName: process.env.STICKER_NAME || "ƝƛȤƲMƛ MƊ",
        description: process.env.DESCRIPTION || "*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ƝƛȤƲMƛ MƊ*",
    },

    // =============================================
    // OWNER INFORMATION
    // =============================================
    owner: {
        number: process.env.OWNER_NUMBER || "YOUR_NUMBER",
        name: process.env.OWNER_NAME || "YOUR_NAME",
        dev: process.env.DEV || "YOUR_NUMBER",
    },

    // =============================================
    // MEDIA CONFIGURATION
    // =============================================
    media: {
        menuImage: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/anvhs2.png",
        aliveImage: process.env.ALIVE_IMG || "https://files.catbox.moe/anvhs2.png",
    },

    // =============================================
    // MESSAGES
    // =============================================
    messages: {
        live: process.env.LIVE_MSG || "> I'm Live Now *ƝƛȤƲMƛ MƊ*⚡",
    },
};

// =============================================
// EXPORT CONFIGURATION
// =============================================
module.exports = {
    // Session
    SESSION_ID: config.session.id,
    
    // Status Features
    AUTO_STATUS_SEEN: config.status.autoSeen,
    AUTO_STATUS_REPLY: config.status.autoReply,
    AUTO_STATUS_REACT: config.status.autoReact,
    AUTO_STATUS_MSG: config.status.autoMessage,
    
    // Group Features
    WELCOME: config.group.welcome,
    ADMIN_EVENTS: config.group.adminEvents,
    
    // Anti Features
    ANTI_LINK: config.anti.link,
    ANTI_LINK_KICK: config.anti.linkKick,
    ANTI_BAD_WORD: config.anti.badWord,
    ANTI_DELETE: config.anti.delete,
    ANTI_CALL: config.anti.call,
    ANTI_VV: config.anti.viewOnce,
    DELETE_LINKS: config.anti.deleteLinks,
    
    // Auto Features
    AUTO_TYPING: config.auto.typing,
    AUTO_RECORDING: config.auto.recording,
    AUTO_REPLY: config.auto.reply,
    AUTO_VOICE: config.auto.voice,
    AUTO_STICKER: config.auto.sticker,
    AUTO_REACT: config.auto.react,
    ALWAYS_ONLINE: config.auto.alwaysOnline,
    
    // Reply Features
    MENTION_REPLY: config.reply.mention,
    READ_MESSAGE: config.reply.readMessage,
    READ_CMD: config.reply.readCommand,
    
    // React Features
    CUSTOM_REACT: config.reaction.custom,
    CUSTOM_REACT_EMOJIS: config.reaction.customEmojis,
    HEART_REACT: config.reaction.heart,
    
    // Bot Configuration
    PREFIX: config.bot.prefix,
    MODE: config.bot.mode,
    PUBLIC_MODE: config.bot.publicMode,
    BOT_NAME: config.bot.name,
    STICKER_NAME: config.bot.stickerName,
    DESCRIPTION: config.bot.description,
    
    // Owner Information
    OWNER_NUMBER: config.owner.number,
    OWNER_NAME: config.owner.name,
    DEV: config.owner.dev,
    
    // Images
    MENU_IMAGE_URL: config.media.menuImage,
    ALIVE_IMG: config.media.aliveImage,
    
    // Messages
    LIVE_MSG: config.messages.live,
    
    // Anti Delete
    ANTI_DEL_PATH: config.anti.deletePath,

    // =============================================
    // UTILITY FUNCTIONS
    // =============================================
    
    /**
     * Check if a feature is enabled
     * @param {string} feature - Feature name to check
     * @returns {boolean}
     */
    isEnabled(feature) {
        const value = this[feature];
        return value === 'true' || value === true;
    },

    /**
     * Get all configuration as object
     * @returns {Object} Complete configuration
     */
    getAll() {
        return {
            session: config.session,
            status: config.status,
            group: config.group,
            anti: config.anti,
            auto: config.auto,
            reply: config.reply,
            reaction: config.reaction,
            bot: config.bot,
            owner: config.owner,
            media: config.media,
            messages: config.messages,
        };
    },

    /**
     * Get bot prefix
     * @returns {string}
     */
    getPrefix() {
        return this.PREFIX;
    },

    /**
     * Check if user is owner
     * @param {string} number - Phone number to check
     * @returns {boolean}
     */
    isOwner(number) {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const ownerClean = this.OWNER_NUMBER.replace(/[^0-9]/g, '');
        const devClean = this.DEV.replace(/[^0-9]/g, '');
        return cleanNumber === ownerClean || cleanNumber === devClean;
    },

    /**
     * Get bot mode
     * @returns {string}
     */
    getMode() {
        return this.MODE;
    },

    /**
     * Check if bot is in public mode
     * @returns {boolean}
     */
    isPublic() {
        return this.MODE === 'public' || this.PUBLIC_MODE === 'true';
    },

    /**
     * Get menu image URL
     * @returns {string}
     */
    getMenuImage() {
        return this.MENU_IMAGE_URL;
    },

    /**
     * Get alive image URL
     * @returns {string}
     */
    getAliveImage() {
        return this.ALIVE_IMG;
    },

    /**
     * Get bot name
     * @returns {string}
     */
    getBotName() {
        return this.BOT_NAME;
    },

    /**
     * Get owner number
     * @returns {string}
     */
    getOwnerNumber() {
        return this.OWNER_NUMBER;
    },

    /**
     * Get owner name
     * @returns {string}
     */
    getOwnerName() {
        return this.OWNER_NAME;
    },

    /**
     * Convert string to boolean
     * @param {string} value 
     * @param {string} trueValue 
     * @returns {boolean}
     */
    toBoolean(value, trueValue = 'true') {
        return convertToBool(value, trueValue);
    }
};

// =============================================
// CONFIGURATION VALIDATION
// =============================================
(function validateConfig() {
    const config = module.exports;
    
    // Validate required fields
    if (!config.SESSION_ID) {
        console.warn('⚠️ WARNING: SESSION_ID is not set!');
    }
    
    if (!config.OWNER_NUMBER) {
        console.warn('⚠️ WARNING: OWNER_NUMBER is not set!');
    }
    
    // Validate URLs
    const urlFields = ['MENU_IMAGE_URL', 'ALIVE_IMG'];
    urlFields.forEach(field => {
        if (config[field] && !config[field].startsWith('http')) {
            console.warn(`⚠️ WARNING: ${field} should be a valid URL!`);
        }
    });
    
    console.log('✅ NAZUMA MD Configuration loaded successfully!');
})();