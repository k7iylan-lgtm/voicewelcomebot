const { Client, GatewayIntentBits } = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior
} = require('@discordjs/voice');
const path = require('path');
require('dotenv').config(); // لتحميل متغيرات البيئة من .env

// قراءة التوكن من متغير البيئة
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// تحقق من وجود التوكن
if (!DISCORD_BOT_TOKEN) {
    console.error('❌ Discord bot token is missing! تأكد من إضافة DISCORD_BOT_TOKEN في الإعدادات');
    process.exit(1);
} else {
    console.log('✅ Token Loaded!');
}

// إنشاء عميل Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// عند تشغيل البوت بنجاح
client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// عند دخول أي عضو قناة صوتية
client.on('voiceStateUpdate', (oldState, newState) => {
    if (!oldState.channel && newState.channel) {
        const voiceChannel = newState.channel;

        // تجاهل البوتات
        if (newState.member.user.bot) return;

        console.log(`👤 ${newState.member.user.tag} joined voice channel: ${voiceChannel.name}`);

        // الانضمام وتشغيل الصوت
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });

        const resource = createAudioResource(path.join(__dirname, 'welcome.mp3'));

        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('▶️ Audio is playing...');
        });

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('⏹️ Audio finished, disconnecting...');
            connection.destroy();
        });

        player.on('error', error => {
            console.error('❌ Audio player error:', error);
        });

        connection.on('error', error => {
            console.error('❌ Connection error:', error);
        });

        connection.on('stateChange', (oldState, newState) => {
            console.log(`🔄 Connection state changed: ${oldState.status} ➜ ${newState.status}`);
        });
    }
});

// تسجيل الدخول
client.login(DISCORD_BOT_TOKEN);
