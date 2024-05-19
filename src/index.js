import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Events,
  Collection,
} from "discord.js";
import { ReacordDiscordJs } from "reacord";

import dotenv from "dotenv";
import express from "express";
import routes from "./routes.js";
import { setupCommands } from "./commands.js";
import { createDiscordServer, guildDelete } from "./utils/db.js";

export const app = express();

app.use(express.json());

dotenv.config();

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

client.login(process.env.DISCORD_BOT_TOKEN);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.guilds.cache.forEach((guild) => {
    console.log(`- ${guild.name} (ID: ${guild.id})`);
  });
});

setupCommands();

client.on("guildCreate", async (guild) => {
  // Save guild info to database
  await createDiscordServer({
    guildId: guild.id,
    guildName: guild.name,
    guildDescription: guild.description,
    guildIcon: guild.icon,
    memberCount: guild.memberCount,
    active: false,
  });

  console.log(
    `Joined a new guild: ${guild.name} (ID: ${guild.id}) (ICON: ${guild.icon}) (ID: ${guild.memberCount})`
  );
  // Optionally, send a welcome message to the guild's default channel
  // Note: The default channel is not always accessible; consider a more specific channel ID if known
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "suprstore-start") {
    const channelId = interaction.channelId; // Get the current channel ID
    console.log(`Command "/start" executed in channel ID: ${channelId}`);

    // Get the guild (server) the interaction happened in
    const guild = await client.guilds.fetch(interaction.guildId);

    // Fetch the current user's profile
    const member = await guild.members.fetch(interaction.user.id);
    const profile = member.user;

    // Get server details
    const serverId = guild.id;
    const serverName = guild.name;
    const serverDescription = guild.description || "No description available";
    const serverIcon = guild.iconURL(); // Get the server's profile picture
    const memberCount = guild.memberCount; // Get the number of members in the server

    const server = await createDiscordServer({
      guildId: serverId,
      guildName: serverName,
      guildDescription: serverDescription,
      guildIcon: serverIcon,
      memberCount: memberCount,
      channelId: channelId,
      active: true,
    });

    console.log("Server created in the database", server);

    interaction.reply(
      `Server ID: ${serverId}\nServer Name: ${serverName}\nServer Description: ${serverDescription}\nServer Icon: ${serverIcon}\nMember Count: ${memberCount}\nYour Profile: ${profile} \n Channel ID: ${channelId}`
    );
  }
});

client.on("guildDelete", async (guild) => {
  console.log(`SuprStore got Kicked from the : ${guild.name}`);

  await guildDelete({ guildId: guild.id });
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

app.use(routes);

app.listen(3001, () => {
  console.log("App listening on port " + 3001);
});
