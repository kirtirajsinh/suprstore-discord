import { prisma } from "./prisma.js";

export async function createDiscordServer({
  guildId,
  guildName,
  guildDescription,
  guildIcon,
  memberCount,
  channelId,
}) {
  try {
    const response = await prisma.Guild.upsert({
      where: {
        serverId: guildId,
      },
      update: {
        serverId: guildId,
        name: guildName,
        description: guildDescription || null,
        serverIcon: guildIcon,
        memberCount: memberCount,
        channelId: channelId,
      },
      create: {
        serverId: guildId,
        name: guildName,
        description: guildDescription || null,
        serverIcon: guildIcon,
        memberCount: memberCount,
        channelId: channelId,
      },
    });
    return response;
  } catch (err) {
    console.error("Error creating server", err);
    throw err;
  }
}
