import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder, ColorResolvable } from 'discord.js';
import { Economy } from '../models/economy';
import { createErrorEmbed } from '../utils/embed';

export const data = new SlashCommandBuilder()
    .setName('siralama')
    .setDescription("En çok coine'e sahip olan kullanıcıları gösterir")
    .addStringOption(option => 
        option.setName('tür')
        .setDescription("Sıralama türünü belirtin")
        .setRequired(true)
        .addChoices(
            { name: 'Cüzdan', value: 'balance' },
            { name: 'Banka', value: 'bank' },
            { name: 'Toplam', value: 'total' }
        ));

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const guildId = interaction.guildId;
    const type = interaction.options.getString('tür');
    const guild = interaction.guild;

    try {
        let sortField = {};
        let title = '';
        let emoji = '';
        let color: ColorResolvable = '#0099ff';

        if (type === 'balance') {
            sortField = { balance: -1 };
            title = 'Cüzdan Sıralaması';
            emoji = '💰';
            color = 0xFFD700;
        } else if (type === 'bank') {
            sortField = { bank: -1 };
            title = 'Banka Sıralaması';
            emoji = '🏦';
            color = 0x4169E1;
        } else {
            title = 'Toplam Varlık Sıralaması';
            emoji = '💵';
            color = 0x32CD32;
        }

        const allEconomies = await Economy.find({ guildId }).sort(sortField).limit(10);

        if (allEconomies.length === 0) {
            const emptyEmbed = new EmbedBuilder()
                .setTitle(`${emoji} ${title}`)
                .setDescription('Hiç veri bulunamadı. İlk sen ol!')
                .setColor(color)
                .setFooter({ text: `${guild?.name || 'Sunucu'} Ekonomi Sistemi` })
                .setTimestamp();
            return interaction.editReply({ embeds: [emptyEmbed] });
        }

        if (type === 'total') {
            allEconomies.sort((a, b) => (b.balance + b.bank) - (a.balance + a.bank));
        }

        const embed = new EmbedBuilder()
            .setTitle(`${emoji} ${title}`)
            .setDescription(`**${guild?.name || 'Sunucu'}** ekonomi sisteminde en zengin 10 kişi`)
            .setColor(color)
            .setThumbnail(guild?.iconURL() || null)
            .setFooter({ 
                text: `${interaction.user.username} tarafından istendi • ${new Date().toLocaleDateString('tr-TR')}`, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp();

        const medals = ['🥇', '🥈', '🥉'];
        let leaderboardText = '';

        for (let i = 0; i < allEconomies.length; i++) {
            const economy = allEconomies[i];
            const user = await interaction.client.users.fetch(economy.userId).catch(() => null);
            const username = user ? user.username : 'Bilinmeyen Kullanıcı';
            const rank = i < 3 ? medals[i] : `${i + 1}.`;

            let value;
            if (type === 'balance') {
                value = economy.balance;
            } else if (type === 'bank') {
                value = economy.bank;
            } else {
                value = economy.balance + economy.bank;
            }

            leaderboardText += `**${rank} ${username}**\n`;
            leaderboardText += `┗ ${emoji} **${value.toLocaleString('tr-TR')}** coin\n\n`;
        }

        embed.setDescription(`**${guild?.name || 'Sunucu'}** ekonomi sisteminde en zengin 10 kişi\n\n${leaderboardText.trim()}`);

        const requestingUser = allEconomies.find(e => e.userId === interaction.user.id);
        if (requestingUser) {
            let userRank = 0;
            let totalUsers = 0;
            
            if (type === 'balance') {
                const allUsers = await Economy.countDocuments({ guildId, balance: { $gt: 0 } });
                const betterUsers = await Economy.countDocuments({ 
                    guildId, 
                    balance: { $gt: requestingUser.balance } 
                });
                userRank = betterUsers + 1;
                totalUsers = allUsers;
            } else if (type === 'bank') {
                const allUsers = await Economy.countDocuments({ guildId, bank: { $gt: 0 } });
                const betterUsers = await Economy.countDocuments({ 
                    guildId, 
                    bank: { $gt: requestingUser.bank } 
                });
                userRank = betterUsers + 1;
                totalUsers = allUsers;
            } else {
                const allUsers = await Economy.countDocuments({ 
                    guildId, 
                    $or: [{ balance: { $gt: 0 } }, { bank: { $gt: 0 } }] 
                });
                
                const total = requestingUser.balance + requestingUser.bank;
                const betterUsers = await Economy.countDocuments({ 
                    guildId, 
                    $expr: { $gt: [{ $add: ["$balance", "$bank"] }, total] } 
                });
                userRank = betterUsers + 1;
                totalUsers = allUsers;
            }

            let userValue;
            if (type === 'balance') {
                userValue = requestingUser.balance;
            } else if (type === 'bank') {
                userValue = requestingUser.bank;
            } else {
                userValue = requestingUser.balance + requestingUser.bank;
            }

            embed.addFields({
                name: '🔍 Senin Sıralaman',
                value: `**${userRank}./${totalUsers}** sıradasın\n${emoji} **${userValue.toLocaleString('tr-TR')}** coin`,
                inline: false
            });
        }

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Sıralama komutu hatası:', error);
        await interaction.editReply({ embeds: [createErrorEmbed('Sıralama bilgileri alınırken bir hata oluştu.')] });
    }
}