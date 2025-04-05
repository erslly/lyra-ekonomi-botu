import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { Economy } from '../models/economy';
import { createEmbed, createErrorEmbed } from '../utils/embed';

export const data = new SlashCommandBuilder()
  .setName('bakiyem')
  .setDescription('Bakiyenizi ve ekonomi bilgilerinizi görüntüler')
  .addUserOption(option => 
    option.setName('kullanici')
      .setDescription('Bakiyesini görmek istediğiniz kullanıcı')
      .setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  
  const targetUser = interaction.options.getUser('kullanici') ?? interaction.user;
  const guildId = interaction.guildId;
  
  try {
    let userEconomy = await Economy.findOne({ userId: targetUser.id, guildId });
    
    if (!userEconomy) {
      userEconomy = await Economy.create({
        userId: targetUser.id,
        guildId,
        balance: 0,
        bank: 0,
        lastDaily: null,
        transactions: []
      });
    }
    
    const formattedBalance = userEconomy.balance.toLocaleString('tr-TR');
    const formattedBank = userEconomy.bank.toLocaleString('tr-TR');
    const totalAssets = userEconomy.balance + userEconomy.bank;
    const formattedTotal = totalAssets.toLocaleString('tr-TR');
    
    const embed = createEmbed(
      `${targetUser.username} Bakiye Bilgileri`,
      `### 💰 Cüzdan
**${formattedBalance}** Coin

### 🏦 Banka
**${formattedBank}** Coin

### 💵 Toplam Varlık
**${formattedTotal}** Coin` 
    );

    embed.setDescription(`${embed.data.description}\n\n-# /transfer yatır yazarak bankanıza para yatırabilirsiniz\n` +
      `-# /transfer çek diyerek bankanızdan para çekebilirsiniz\n` +
      `-# /günlük yazarak günlük ödülünüzü alabilirsiniz`);

    embed.setThumbnail(targetUser.displayAvatarURL())
         .setFooter({ text: `ID: ${targetUser.id} • Son güncelleme: ${new Date().toLocaleTimeString('tr-TR')}` });
    
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Bakiye komutu hatası:', error);
    await interaction.editReply({ 
      embeds: [createErrorEmbed('Bakiye bilgisi alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.')]
    });
  }
}
