import { Client, GatewayIntentBits, Collection, Events, Interaction, REST, Routes, ChatInputCommandInteraction } from 'discord.js';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

config();

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
  }
}

interface Command {
  data: any;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

const commands: any[] = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.log(`[UYARI] ${filePath} komutunda "data" veya "execute" eksik.`);
  }
}

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

client.once(Events.ClientReady, async (c) => {
  console.log(`Bot ${c.user.tag} olarak giriş yaptı!`);
  console.log('Developed By Erslly');
  
  c.user.setActivity('Developed By Erslly', { type: 4 });
  
  try {
    const rest = new REST().setToken(process.env.TOKEN!);
    
    console.log('Slash komutları kaydediliyor...');
    
    await rest.put(
      Routes.applicationCommands(c.user.id),
      { body: commands }
    );
    
    console.log('Slash komutları başarıyla kaydedildi!');
  } catch (error) {
    console.error('Komutları kaydederken hata oluştu:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`${interaction.commandName} komutu bulunamadı.`);
    return;
  }
  
  try {
    await command.execute(interaction as ChatInputCommandInteraction);
  } catch (error) {
    console.error(`${interaction.commandName} komutu çalıştırılırken hata:`, error);
    
    const errorReply = {
      content: 'Bu komutu çalıştırırken bir hata oluştu!',
      ephemeral: true
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorReply);
    } else {
      await interaction.reply(errorReply);
    }
  }
});

client.login(process.env.TOKEN);
