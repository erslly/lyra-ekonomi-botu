import { EmbedBuilder, ColorResolvable } from 'discord.js';

export function createEmbed(
  title: string, 
  description: string, 
  color: ColorResolvable = '#0099ff'
): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}

export function createErrorEmbed(description: string): EmbedBuilder {
    return createEmbed('Hata', description, '#ff0000');
}

export function createSuccessEmbed(description: string): EmbedBuilder {
    return createEmbed('Başarılı', description, '#00ff00');
}