import dotenv from 'dotenv'

dotenv.configDotenv()

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, GUILD_ID, SERVER_IP } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !GUILD_ID || !SERVER_IP) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  GUILD_ID,
  SERVER_IP
};
