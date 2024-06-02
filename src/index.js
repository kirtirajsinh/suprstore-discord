import {
  Client,
  GatewayIntentBits,
  Collection,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  UserSelectMenuBuilder,
  StringSelectMenuBuilder,
  time,
  Component,
  ComponentType,
  EmbedBuilder,
} from "discord.js";

import dotenv from "dotenv";
import express from "express";
import routes from "./routes.js";
import { setupCommands } from "./commands.js";
import {
  createDiscordServer,
  getTags,
  guildDelete,
  updateGuildTag,
} from "./utils/db.js";

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
    const channel = await client.channels.fetch(channelId);
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

    const tags = await getTags();
    console.log("Tags fetched from the database", tags);

    const welcomeEmbed = new EmbedBuilder()
      .setTitle("SuprStore")
      .setDescription("Welcome to SuprStore! 🎊")
      .setColor("#0099ff")
      .setThumbnail(serverIcon);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(interaction.id)
      .setPlaceholder("Select Tags ")
      .setMinValues(1)
      .setMaxValues(6)
      .addOptions(
        tags.map((tag) =>
          new StringSelectMenuOptionBuilder()
            .setValue(tag.tagId)
            .setLabel(tag.name)
        )
      );
    await channel.send({
      content: "Welcome to SuprStore! 🎊",
      embeds: [welcomeEmbed],
    });

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.reply({
      content:
        "Select Tags that describes your Server and that your community would find helpful to see products for!",
      components: [actionRow],
    });
    const collector = selectReply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (i) =>
        i.user.id === interaction.user.id && i.customId === interaction.id,
      time: 60_000,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.values.length) {
        interaction.reply({
          content: "Please select atleast one starter",
          ephemeral: true,
        });
      } else {
        const response = await updateGuildTag(serverId, interaction.values);
        console.log("Tag updated in the database", response);
        interaction.reply({
          content: `Your Tags have been Selected. If you want to make changes please use the command /Suprstore-start and select the tags again!`,
          ephemeral: true,
        });
      }
    });
  }
});

client.on("guildUpdate", async (oldGuild, newGuild) => {
  console.log(
    `SuprStore got updated in the : ${oldGuild.name} (ID: ${oldGuild.id})`
  );
  // Update the server info in the database
  await createDiscordServer({
    guildId: newGuild.id,
    guildName: newGuild.name,
    guildDescription: newGuild.description,
    guildIcon: newGuild.icon,
    memberCount: newGuild.memberCount,
  });
  console.log("Guild Updated. Therefore Updated the Guild in the Database.");
  // Optionally, send a welcome message to the guild's default channel
  // Note: The default channel is not always accessible; consider a more specific channel ID if known
  // Optionally, send a welcome message to the guild's default channel
  // Note: The default channel is not always accessible; consider a more specific channel ID if known
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
