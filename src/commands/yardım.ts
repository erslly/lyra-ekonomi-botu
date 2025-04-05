import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder, ColorResolvable } from 'discord.js';
import { createEmbed, createErrorEmbed } from '../utils/embed';

export const data = new SlashCommandBuilder()
    .setName('yardım')
    .setDescription('Komutlar hakkında bilgi alın');

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        await interaction.deferReply({ ephemeral: false });

        const embed = new EmbedBuilder()
            .setTitle('Lyra Bot Komutları')
            .setDescription('Aşağıda kullanabileceğiniz tüm komutların listesi bulunmaktadır.')
            .setColor(0xFF69B4 as ColorResolvable)
            .setThumbnail(interaction.client.user?.displayAvatarURL() || null)
            .setTimestamp()
            .setFooter({ 
                text: `${interaction.user.username} tarafından istendi`, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .addFields(
                {
                    name: '💰 Ekonomi Komutları',
                    value: `
\`/bakiye\` - Bakiyenizi ve ekonomi bilgilerinizi görüntüleyin
\`/günlük\` - Günlük coin ödülünüzü alın
\`/calis\` - Çalışarak coin kazanın
\`/siralama\` - En zengin kullanıcıları görüntüleyin
`,
                    inline: false
                },
                {
                    name: '🏦 Banka İşlemleri',
                    value: `
\`/transfer gönder\` - Başka bir kullanıcıya coin gönderin
\`/transfer yatir\` - Cüzdanınızdan bankaya coin yatırın
\`/transfer çek\` - Bankadan cüzdanınıza coin çekin
`,
                    inline: false
                },
                {
                    name: '🛍️ Market İşlemleri',
                    value: `
\`/market\` - Sunucu marketini görüntüleyin
\`/satin-al\` - Marketten ürün satın alın
\`/envanter\` - Envanterinizi görüntüleyin
`,
                    inline: false
                },
                {
                    name: '📊 Sıralama Sistemi',
                    value: `
\`/siralama cüzdan\` - Cüzdan bakiyesine göre sıralama
\`/siralama banka\` - Banka bakiyesine göre sıralama
\`/siralama toplam\` - Toplam varlığa göre sıralama
`,
                    inline: false
                },
                {
                    name: '❓ Nasıl Kullanılır?',
                    value: `
1️⃣ \`/calis\` komutu ile coin kazanmaya başlayın (5 dakikada bir kullanabilirsiniz)
2️⃣ \`/günlük\` komutunu her gün kullanarak bonus coin kazanın
3️⃣ \`/market\` komutunu kullanarak neler alabileceğinizi görün
4️⃣ \`/satin-al\` komutu ile istediğiniz ürünü satın alın
5️⃣ \`/transfer\` komutu ile paranızı güvende tutun veya arkadaşlarınızla paylaşın
6️⃣ \`/siralama\` komutu ile en zenginler arasında yerinizi görün
`,
                    inline: false
                },
                {
                    name: '🔗 Yararlı Bağlantılar',
                    value: `
• [Geliştirici](https://erslly.xyz/)
• [GitHub](https://github.com/)
`,
                    inline: false
                }
            );

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Yardım komutu hatası:', error);
        await interaction.editReply({
            embeds: [createErrorEmbed('Yardım menüsü gösterilirken bir hata oluştu.')]
        });
    }
} 