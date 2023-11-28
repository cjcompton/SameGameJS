import dotenv from 'dotenv'

dotenv.configDotenv()

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, GUILD_ID, SERVER_IP, DEV_MODE } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !GUILD_ID || !SERVER_IP || !DEV_MODE) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  GUILD_ID,
  SERVER_IP,
  DEV_MODE
};
