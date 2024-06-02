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

export async function getTags() {
  try {
    const response = await prisma.Tag.findMany();
    return response;
  } catch (err) {
    console.error("Error getting tags", err);
    throw err;
  }
}

export async function updateGuildTag(guildId, tagIds) {
  try {
    const response = await prisma.guild.update({
      where: {
        serverId: guildId,
      },
      data: {
        Tag: {
          set: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });
    return response;
  } catch (err) {
    console.error("Error updating tags", err);
    throw err;
  }
}
