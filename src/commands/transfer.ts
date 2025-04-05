import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Economy } from '../models/economy';
import { createEmbed, createErrorEmbed, createSuccessEmbed } from '../utils/embed';

export const data = new SlashCommandBuilder()
  .setName('transfer')
  .setDescription('Para transferi yapın')
  .addSubcommand(subcommand => 
    subcommand
      .setName('gönder')
      .setDescription('Diğer bir kullanıcıya para gönderin')
      .addUserOption(option => 
        option.setName('kullanıcı')
          .setDescription('Para göndermek istediğiniz kullanıcı')
          .setRequired(true))
      .addIntegerOption(option => 
        option.setName('miktar')
          .setDescription('Göndermek istediğiniz miktar')
          .setRequired(true)))
  .addSubcommand(subcommand => 
    subcommand
      .setName('yatir')
      .setDescription('Cüzdanınızdan bankaya para yatırın')
      .addIntegerOption(option => 
        option.setName('miktar')
          .setDescription('Yatırmak istediğiniz miktar')
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('çek')
      .setDescription('Bankadan cüzdanınıza para çekin')
      .addIntegerOption(option => 
        option.setName('miktar')
          .setDescription('Çekmek istediğiniz miktar')
          .setRequired(true)));

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.deferReply({ ephemeral: false });

        const userId = interaction.user.id;
        const guildId = interaction.guildId;
        const subcommand = interaction.options.getSubcommand();
        const amount = interaction.options.getInteger('miktar');

        if (!amount || amount <= 0) {
            return interaction.editReply({ 
                embeds: [createErrorEmbed('Geçersiz miktar. Pozitif bir sayı girmelisiniz.')] 
            });
        }   

        let userEconomy = await Economy.findOne({ userId, guildId });

        if(!userEconomy) {
            userEconomy = await Economy.create({
                userId,
                guildId,
                balance: 0,
                bank: 0
            });
        }

        if (subcommand === 'gönder') {
            const targetUser = interaction.options.getUser('kullanıcı');

            if (!targetUser) {
                return interaction.editReply({ 
                    embeds: [createErrorEmbed('Geçersiz kullanıcı.')] 
                });
            }

            if (targetUser.id === userId) {
                return interaction.editReply({ 
                    embeds: [createErrorEmbed('Kendinize para gönderemezsiniz.')] 
                });
            }

            if (userEconomy.balance < amount) {
                return interaction.editReply({ 
                    embeds: [createErrorEmbed(`Yeterli bakiyeniz yok. Mevcut bakiyeniz: ${userEconomy.balance.toLocaleString('tr-TR')} coin`)] 
                });
            }

            let targetEconomy = await Economy.findOne({ userId: targetUser.id, guildId });

            if (!targetEconomy) {
                targetEconomy = await Economy.create({
                    userId: targetUser.id,
                    guildId,
                    balance: 0,
                    bank: 0
                });
            }

            userEconomy.balance -= amount;
            targetEconomy.balance += amount;

            await userEconomy.save();
            await targetEconomy.save();

            return interaction.editReply({
                embeds: [createSuccessEmbed(`Başarıyla ${targetUser.username} adlı kullanıcıya ${amount.toLocaleString('tr-TR')} coin gönderdiniz.\n\nMevcut bakiyeniz: ${userEconomy.balance.toLocaleString('tr-TR')} coin`)]
            });
        }

        else if (subcommand === 'yatir') {
            if (userEconomy.balance < amount) {
                return interaction.editReply({ 
                    embeds: [createErrorEmbed(`Yeterli bakiyeniz yok. Mevcut bakiyeniz: ${userEconomy.balance.toLocaleString('tr-TR')} coin`)] 
                });
            }

            userEconomy.balance -= amount;
            userEconomy.bank += amount;

            await userEconomy.save();

            return interaction.editReply({
                embeds: [createSuccessEmbed(`${amount.toLocaleString('tr-TR')} coin bankaya yatırıldı!\n\nCüzdan: ${userEconomy.balance.toLocaleString('tr-TR')} coin\nBanka: ${userEconomy.bank.toLocaleString('tr-TR')} coin`)] 
            });
        }

        else if (subcommand === 'çek') {
            if (userEconomy.bank < amount) {
                return interaction.editReply({ 
                    embeds: [createErrorEmbed(`Bankada yeterli bakiyeniz yok. Banka bakiyeniz: ${userEconomy.bank.toLocaleString('tr-TR')} coin`)] 
                });
            }

            userEconomy.bank -= amount;
            userEconomy.balance += amount;

            await userEconomy.save();

            return interaction.editReply({
                embeds: [createSuccessEmbed(`${amount.toLocaleString('tr-TR')} coin bankadan çekildi!\n\nCüzdan: ${userEconomy.balance.toLocaleString('tr-TR')} coin\nBanka: ${userEconomy.bank.toLocaleString('tr-TR')} coin`)] 
            });
        } else {
            return interaction.editReply({
                embeds: [createErrorEmbed('Geçersiz alt komut.')]
            });
        }
    } catch (error) {
        console.error('Transfer komutu hatası:', error);
        try {
            await interaction.editReply({ 
                embeds: [createErrorEmbed('Para transferi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.')] 
            });
        } catch (e) {
            console.error('Hata mesajı gönderilemedi:', e);
        }
    }
}