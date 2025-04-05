import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Economy } from '../models/economy';
import { createEmbed, createErrorEmbed } from '../utils/embed';

const DAILY_AMOUNT = 100;
const COOLDOWN = 24 * 60 * 60 * 1000;

export const data = new SlashCommandBuilder()
  .setName('günlük')
  .setDescription('Günlük coin ödülünüzü alın');

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();
  
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  
  try {
    let userEconomy = await Economy.findOne({ userId, guildId });
    
    if (!userEconomy) {
      userEconomy = await Economy.create({
        userId,
        guildId,
        balance: 0,
        bank: 0,
        lastDaily: new Date(0)
      });
    }
    
    const now = new Date();
    const lastDaily = new Date(userEconomy.lastDaily);
    const timeDiff = now.getTime() - lastDaily.getTime();
    
    if (timeDiff < COOLDOWN) {
        const remainingTime = COOLDOWN - timeDiff;
        const hours = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        
        const nextAvailableTime = Date.now() + remainingTime;
        return interaction.editReply({ 
        embeds: [createErrorEmbed(`Günlük ödülünüzü zaten aldınız! <t:${Math.floor(nextAvailableTime/1000)}:R> dakika sonra tekrar alabilirsiniz.`)] 
        });
      }
    
    userEconomy.balance += DAILY_AMOUNT;
    userEconomy.lastDaily = now;
    await userEconomy.save();
    
    const embed = createEmbed(
      'Günlük Ödül',
      `💰 **${DAILY_AMOUNT}** coin günlük ödülünüzü aldınız!\n\nYeni bakiyeniz: **${userEconomy.balance}** coin`
    );
    
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Günlük komut hatası:', error);
    await interaction.editReply({ embeds: [createErrorEmbed('Günlük ödül alınırken bir hata oluştu.')] });
  }
}