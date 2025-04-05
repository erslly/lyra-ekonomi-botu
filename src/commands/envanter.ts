import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Inventory } from '../models/inventory';
import { ShopItem } from '../models/shop';
import { createEmbed, createErrorEmbed } from '../utils/embed';
import { Types } from 'mongoose';

export const data = new SlashCommandBuilder()
  .setName('envanter')
  .setDescription('Envanterinizi görüntüleyin')
  .addUserOption(option => 
    option.setName('kullanici')
    .setDescription('Envanterini görmek istediğiniz kullanıcı')
    .setRequired(false));

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const targetUser = interaction.options.get('kullanici')?.user || interaction.user;
    const guildId = interaction.guildId;

    try {
        const inventory = await Inventory.findOne({ userId: targetUser.id, guildId });
        if (!inventory || inventory.items.length === 0) {
            return interaction.editReply({ 
                embeds: [createEmbed(`${targetUser.username}'nin Envanteri`, 'Hiç eşya yok.')] 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${targetUser.username}'nin Envanteri`)
            .setDescription('Sahip olduğunuz eşyalar aşağıda listeleniyor.')
            .setColor('#0099ff')
            .setTimestamp();

        for (const item of inventory.items) {
            const shopItem = await ShopItem.findById(item.itemId);
            if (!shopItem) continue;

            const purchaseDate = new Date(item.purchasedAt).toLocaleDateString('tr-TR');
            embed.addFields({
                name: `${shopItem.name} (${item.quantity} adet)`,
                value: `${shopItem.description}\nSatın alınma tarihi: ${purchaseDate}`
            });
        }

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.log('Envanter komutu hatası:', error);
        await interaction.editReply({ embeds: [createErrorEmbed('Envanter bilgileri alınırken bir hata oluştu.')] });
    }
}
