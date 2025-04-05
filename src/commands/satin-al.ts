import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember } from 'discord.js';
import { Economy } from '../models/economy';
import { ShopItem } from '../models/shop';
import { Inventory } from '../models/inventory';
import { createEmbed, createErrorEmbed, createSuccessEmbed } from '../utils/embed';
import { Types } from 'mongoose';

export const data = new SlashCommandBuilder()
  .setName('satin-al')
  .setDescription('Marketten ürün satın alın')
  .addStringOption(option => 
    option.setName('urun')
    .setDescription('Satın almak istediğiniz ürünün adı')
    .setRequired(true));

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const itemName = interaction.options.get('urun')?.value as string;

    try {
        const item = await ShopItem.findOne({
            guildId,
            name: { $regex: new RegExp(`^${itemName}$`, 'i') } 
        });

        if(!item) {
            return interaction.editReply({
            embeds: [createErrorEmbed(`"${itemName}" adında bir ürün bulunamadı.`)]
            });
        }

        const stock = item.stock ?? -1;
        if (stock !== -1 && stock <= 0) {
            return interaction.editReply({
                embeds: [createErrorEmbed(`"${itemName}" ürünü stokta bulunmadığından satın alamadınız.`)]
            });
        }

        const userEconomy = await Economy.findOne({ userId, guildId });

        if(!userEconomy || userEconomy.balance < item.price) {
            return interaction.editReply({
                embeds: [createErrorEmbed(`Bu ürünü satın almak için yeterli coininiz yok. Gereken: ${item.price} coin, Mevcut: ${userEconomy?.balance || 0} coin`)] 
            });
        }

        let inventory = await Inventory.findOne({ userId, guildId });

        if (!inventory) {
            inventory = await Inventory.create({ userId, guildId, items: [] });
        }

        const existingItem = inventory.items.find(invItem => 
        invItem.itemId.toString() === (item._id as Types.ObjectId).toString());

        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.purchasedAt = new Date();
        } else {
            inventory.items.push({
            itemId: item._id as Types.ObjectId,
            quantity: 1,
            purchasedAt: new Date()
            });
        }

        if (item.role) {
            const member = interaction.member;
            if (member instanceof GuildMember && !member.roles.cache.has(item.role)) {
                try {
                    await member.roles.add(item.role);
                } catch (err) {
                    console.error('Rol verme hatası:', err);
                    return interaction.editReply({
                        embeds: [createErrorEmbed('Rol verilirken bir hata oluştu. Lütfen yetkililerle iletişime geçin.')]
                    });
                }
            }
        }

        if (stock > 0) {
            item.stock = stock - 1;
            await item.save();
        }

        userEconomy.balance -= item.price;
        await userEconomy.save();
        await inventory.save();

        const embed = createSuccessEmbed(
        `"${item.name}" ürününü ${item.price.toLocaleString('tr-TR')} coin karşılığında satın aldınız!\n\nYeni bakiyeniz: **${userEconomy.balance.toLocaleString('tr-TR')}** coin`
        );

        await interaction.editReply({ embeds: [embed] })
    } catch (error) {
        console.error('Satın alma komutu hatası:', error);
        await interaction.editReply({
            embeds: [createErrorEmbed('Satın alma işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.')]
        });
    }
}