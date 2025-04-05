import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { ShopItem } from '../models/shop';
import { createEmbed, createErrorEmbed } from '../utils/embed';

export const data = new SlashCommandBuilder()
  .setName('market')
  .setDescription('Marketten alışveriş yapın');

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const guildId = interaction.guildId;

    try {
        const shopItems = await ShopItem.find({ guildId });

        if (shopItems.length === 0) {
            return interaction.editReply({
                embeds: [createEmbed('Market', 'Markette şu anda hiç ürün yok.')]
            });          
        }

        const embed = new EmbedBuilder()
        .setTitle('Market')
        .setDescription('Aşağıdaki ürünleri `/satin-al [ürün adı]` komutu ile satın alabilirsiniz.')
        .setColor('#0099ff')
        .setTimestamp();

        shopItems.forEach((item, index) => {
            const stockInfo = item.stock === -1 ? 'Sınırsız' : `${item.stock} adet`;
            embed.addFields({
                name: `${index + 1}. ${item.name} - ${item.price} coin`,
                value: `${item.description}\nStok: ${stockInfo}${item.role ? `\nRol: <@&${item.role}>` : ''}`
            });
        });

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Market komutu hatası:', error);
        await interaction.editReply({ embeds: [createErrorEmbed('Market bilgileri alınırken bir hata oluştu.')] });
    }
}
  