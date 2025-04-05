import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, ColorResolvable } from 'discord.js';
import { Economy } from '../models/economy';
import { createEmbed, createErrorEmbed } from '../utils/embed';

const MIN_WORK_AMOUNT = 50;
const MAX_WORK_AMOUNT = 200;
const COOLDOWN = 5 * 60 * 1000; 
const MAX_WORK_PER_DAY = 5;
const WORK_COLOR: ColorResolvable = '#FFD700';

const WORK_MESSAGES = [
    "Bir web sitesi tasarladınız ve {amount} coin kazandınız.",
    "Bir dükkanda part-time çalıştınız ve {amount} coin kazandınız.",
    "Bahçe düzenlemesi yaptınız ve {amount} coin kazandınız.",
    "Birinin evcil hayvanına baktınız ve {amount} coin kazandınız.",
    "Bir yazılım bug'ını düzelttiniz ve {amount} coin kazandınız.",
    "Online bir anket doldurdunuz ve {amount} coin kazandınız.",
    "Komşunuzun çimleri biçtiniz ve {amount} coin kazandınız.",
    "Hasta bir arkadaşınıza yardım ettiniz ve {amount} coin kazandınız."
  ];

export const data = new SlashCommandBuilder()
  .setName('çalış')
  .setDescription('Çalışarak para kazanın');

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const username = interaction.user.username;
    const now = new Date();
    const formattedTime = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR')}`;

    try {
        let userEconomy = await Economy.findOne({ userId, guildId });

        if (!userEconomy) {
            userEconomy = await Economy.create({
              userId,
              guildId,
              balance: 0,
              bank: 0,
              lastWork: new Date(0),
              workCount: 0
            });
        }

        const lastWork = new Date(userEconomy.lastWork);
        const timeDiff = now.getTime() - lastWork.getTime();

        if (timeDiff >= 24 * 60 * 60 * 1000) {
            userEconomy.workCount = 0;
        }

        if (userEconomy.workCount >= MAX_WORK_PER_DAY) {
            return interaction.editReply({
                embeds: [createErrorEmbed(`**${username}**, bugün için çalışma limitinize ulaştınız! Yarın tekrar çalışabilirsiniz.`)
                    .setFooter({ text: `${formattedTime} • Limit` })
                ] 
            });
        }

        if (timeDiff < COOLDOWN) {
            const remainingTime = COOLDOWN - timeDiff;
            const nextAvailableTime = Date.now() + remainingTime;
            
            return interaction.editReply({
                embeds: [createErrorEmbed(`**${username}**, çok yorgunsun! <t:${Math.floor(nextAvailableTime/1000)}:R> sonra tekrar çalışabilirsin.`)
                    .setFooter({ text: `${formattedTime} • Cooldown` })
                ] 
            });
        }

        const amount = Math.floor(Math.random() * (MAX_WORK_AMOUNT - MIN_WORK_AMOUNT + 1)) + MIN_WORK_AMOUNT;

        const messageIndex = Math.floor(Math.random() * WORK_MESSAGES.length);
        const workMessage = WORK_MESSAGES[messageIndex].replace('{amount}', `**${amount}**`);

        userEconomy.balance += amount;
        userEconomy.lastWork = now;
        userEconomy.workCount += 1;
        await userEconomy.save();

        const nextWorkTime = new Date(now.getTime() + COOLDOWN);
        const nextWorkTimestamp = Math.floor(nextWorkTime.getTime() / 1000);

        const embed = createEmbed(
            'Çalışma Sonucu',
            `${workMessage}\n\n**Bakiye Bilgisi:**\n• Yeni bakiyeniz: **${userEconomy.balance.toLocaleString('tr-TR')}** coin\n• Kazanç: **+${amount.toLocaleString('tr-TR')}** coin\n• Banka: **${userEconomy.bank.toLocaleString('tr-TR')}** coin\n\nSonraki çalışma: <t:${nextWorkTimestamp}:R>`
        )
            .setColor(WORK_COLOR)
            .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
            .setTimestamp(now)
            .setFooter({ 
                text: username,
                iconURL: interaction.user.displayAvatarURL() 
            });

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Çalışma komutu hatası:', error);
        await interaction.editReply({ 
            embeds: [createErrorEmbed('Çalışma yapılırken bir hata oluştu.')
                .setFooter({ text: `${formattedTime} • Hata` })
            ] 
        });
    }
}