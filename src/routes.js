import { Router } from "express";
import { client } from "./index.js";
import {
  EmbedBuilder,
  Embed,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";

const router = Router();

router.get("/yo", (req, res) => {
  res.send("Hello World!");
});

router.post("/post", async (req, res) => {
  const {
    channelId,
    title,
    description,
    url,
    Image,
    buttonDetails,
    tagEveryone,
  } = req.body;

  if (!channelId) {
    return res.status(400).send("Channel ID is required");
  }

  console.log(`Received request to send embed to channel: ${channelId}`);

  const channel = await client.channels.fetch(channelId);
  console.log(`Sending embed to channel: ${channel}`);

  const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(title)
    .setURL(url)
    .setDescription(description)
    .setImage(Image)
    .setTimestamp();

  const buttons = new ActionRowBuilder();

  await buttonDetails.map((button) => {
    const buttonComponent = new ButtonBuilder()
      .setLabel(button.label ?? "Link")
      .setURL(button.url)
      .setStyle(ButtonStyle.Link);
    buttons.addComponents(buttonComponent);
  });

  if (!channel) {
    return res.status(404).send("Channel not found");
  } else {
    const messageContent = tagEveryone ? "@everyone" : "";

    await channel
      .send({
        content: messageContent,
        embeds: [exampleEmbed],
        components: [buttons],
      })

      .then(() => {
        res.status(200).json({ message: "Embed sent successfully" });
      })
      .catch((error) => {
        console.error("Error sending embed:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  }
});

router.get("/botdetails", async (req, res) => {
  try {
    const botDetails = [];

    // Fetching guilds
    const guilds = await client.guilds.fetch();
    console.log("Fetched guilds:", guilds);

    // Check if guilds collection is empty
    if (guilds.size === 0) {
      console.log("No guilds found.");
      res.status(200).json(botDetails); // Return empty array
      return;
    }

    // Iterating through guilds
    for (const guild of guilds.values()) {
      console.log(`Guild: ${guild.name} (${guild.id})`);

      const guildDetails = await client.guilds.fetch(guild.id);
      console.log("Guild details:", guildDetails);

      const botDetail = {
        guildId: guild.id,
        guildName: guild.name,
        guildDescription: guild.description || "No description available",
        guildIcon: guild.iconURL(),
        guildMemberCount: guild.memberCount,
      };
      botDetails.push(botDetail);
    }

    // Logging and sending response
    console.log("Bot details:", botDetails);
    res.status(200).json(botDetails);
  } catch (error) {
    console.error("Error fetching bot details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
