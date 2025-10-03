const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('clientReady', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (!oldState.channel && newState.channel) {
        const voiceChannel = newState.channel;

        if (newState.member.user.bot) return;

        console.log(`User ${newState.member.user.tag} joined voice channel ${voiceChannel.name}`);

        // تأخير 2 ثانية قبل الترحيب
        setTimeout(() => {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play,
                }
            });

            const resource = createAudioResource(path.join(__dirname, 'welcome.mp3'));

            player.play(resource);
            connection.subscribe(player);

            player.on('error', error => {
                console.error('Audio player error:', error);
            });

            player.on(AudioPlayerStatus.Playing, () => {
                console.log('Audio is now playing!');
            });

            player.on(AudioPlayerStatus.Idle, () => {
                console.log('Audio finished playing, disconnecting...');
                connection.destroy();
            });

            connection.on('stateChange', (oldState, newState) => {
                console.log(`Connection state changed from ${oldState.status} to ${newState.status}`);
            });

            connection.on('error', error => {
                console.error('Connection error:', error);
            });
        }, 0);  // هنا التأخير 2 ثانية
    }
});

client.login('MTQyMzczNTkxMTQ0MjY3NzgxMg.GplDzP.Ep5k5IolSg7t8dhuivJI15-dA2tOKpM-nCyUGc');