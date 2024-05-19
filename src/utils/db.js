import { prisma } from "./prisma.js";

export async function createDiscordServer({
  guildId,
  guildName,
  guildDescription,
  guildIcon,
  memberCount,
  channelId,
  active,
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
        active: active,
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

export async function guildDelete({ guildId }) {
  try {
    const response = await prisma.Guild.update({
      where: {
        serverId: guildId,
      },
      data: {
        active: false,
      },
    });
    return response;
  } catch (err) {
    console.error("Error deleting server", err);
    throw err;
  }
}
