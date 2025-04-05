import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import { Economy } from '../models/economy';
import { ShopItem } from '../models/shop';
import { createEmbed, createErrorEmbed, createSuccessEmbed } from '../utils/embed';

const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [];

export const data = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Admin komutları')
  .addSubcommand(subcommand =>
    subcommand
      .setName('para_ver')
      .setDescription('Kullanıcıya para ver')
      .addUserOption(option => option.setName('kullanici').setDescription('Para vermek istediğiniz kullanıcı').setRequired(true))
      .addIntegerOption(option => option.setName('miktar').setDescription('Vermek istediğiniz miktar').setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('para_al')
      .setDescription('Kullanıcıdan para al')
      .addUserOption(option => option.setName('kullanici').setDescription('Para almak istediğiniz kullanıcı').setRequired(true))
      .addIntegerOption(option => option.setName('miktar').setDescription('Almak istediğiniz miktar').setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('urun_ekle')
      .setDescription('Markete ürün ekle')
      .addStringOption(option => option.setName('isim').setDescription('Ürün ismi').setRequired(true))
      .addStringOption(option => option.setName('aciklama').setDescription('Ürün açıklaması').setRequired(true))
      .addIntegerOption(option => option.setName('fiyat').setDescription('Ürün fiyatı').setRequired(true))
      .addRoleOption(option => option.setName('rol').setDescription('Ürünle verilecek rol').setRequired(false))
      .addIntegerOption(option => option.setName('stok').setDescription('Ürün stok adedi (-1 = sınırsız)').setRequired(false)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('urun_sil')
      .setDescription('Marketten ürün sil')
      .addStringOption(option => option.setName('isim').setDescription('Silinecek ürünün ismi').setRequired(true)));

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  
  const userId = interaction.user.id;
  
  if (!ADMIN_IDS.includes(userId)) {
    return interaction.editReply({ 
      embeds: [createErrorEmbed('Bu komutu kullanmak için yetkiniz yok.')] 
    });
  }
  
  const guildId = interaction.guildId;
  const subcommand = interaction.options.getSubcommand();
  
  try {
    if (subcommand === 'para_ver') {
      const targetUser = interaction.options.getUser('kullanici');
      const amount = interaction.options.getInteger('miktar');
      
      if (!targetUser || !amount || amount <= 0) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed('Geçersiz kullanıcı veya miktar. Pozitif bir sayı girmelisiniz.')] 
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
      
      targetEconomy.balance += amount;
      await targetEconomy.save();
      
      return interaction.editReply({ 
        embeds: [createSuccessEmbed(`${targetUser.username} kullanıcısına ${amount.toLocaleString('tr-TR')} coin verildi!\n\nYeni bakiyesi: ${targetEconomy.balance.toLocaleString('tr-TR')} coin`)] 
      });
    } 
    else if (subcommand === 'para_al') {
      const targetUser = interaction.options.getUser('kullanici');
      const amount = interaction.options.getInteger('miktar');
      
      if (!targetUser || !amount || amount <= 0) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed('Geçersiz kullanıcı veya miktar. Pozitif bir sayı girmelisiniz.')] 
        });
      }
      
      let targetEconomy = await Economy.findOne({ userId: targetUser.id, guildId });
      
      if (!targetEconomy) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed(`${targetUser.username} kullanıcısının henüz ekonomi verileri bulunmuyor.`)] 
        });
      }
      
      if (targetEconomy.balance < amount) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed(`${targetUser.username} kullanıcısının yeterli bakiyesi yok. Mevcut bakiyesi: ${targetEconomy.balance.toLocaleString('tr-TR')} coin`)] 
        });
      }
      
      targetEconomy.balance -= amount;
      await targetEconomy.save();
      
      return interaction.editReply({ 
        embeds: [createSuccessEmbed(`${targetUser.username} kullanıcısından ${amount.toLocaleString('tr-TR')} coin alındı!\n\nYeni bakiyesi: ${targetEconomy.balance.toLocaleString('tr-TR')} coin`)] 
      });
    } 
    else if (subcommand === 'urun_ekle') {
      const name = interaction.options.getString('isim');
      const description = interaction.options.getString('aciklama');
      const price = interaction.options.getInteger('fiyat');
      const role = interaction.options.getRole('rol')?.id;
      const stock = interaction.options.getInteger('stok') ?? -1;
      
      if (!name || !description || !price || price <= 0) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed('Geçersiz ürün bilgileri. Lütfen tüm alanları doğru doldurun.')] 
        });
      }
      
      const existingItem = await ShopItem.findOne({ 
        guildId, 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
      });
      
      if (existingItem) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed(`"${name}" adında bir ürün zaten mevcut.`)] 
        });
      }
      
      const newItem = await ShopItem.create({
        guildId,
        name,
        description,
        price,
        role,
        stock
      });
      
      return interaction.editReply({ 
        embeds: [createSuccessEmbed(`"${name}" adlı ürün ${price.toLocaleString('tr-TR')} coin fiyatla markete eklendi!`)] 
      });
    } 
    else if (subcommand === 'urun_sil') {
      const name = interaction.options.getString('isim');
      
      if (!name) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed('Geçersiz ürün ismi.')] 
        });
      }
      
      const item = await ShopItem.findOne({ 
        guildId, 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
      });
      
      if (!item) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed(`"${name}" adında bir ürün bulunamadı.`)] 
        });
      }
      
      await item.deleteOne();
      
      return interaction.editReply({ 
        embeds: [createSuccessEmbed(`"${item.name}" adlı ürün marketten silindi!`)] 
      });
    }
  } catch (error) {
    console.error('Admin komutu hatası:', error);
    await interaction.editReply({ embeds: [createErrorEmbed('Komut işlenirken bir hata oluştu.')] });
  }
}