import axios from "axios"
import { config } from "../config"
// check auth
export async function checkAuth(userIds: string[]) {
  try {
    const authUserResponse = await axios.post<AuthResponse>(`${config.SERVER_IP}/checkauth`, {
      userIds: userIds
    })
    return authUserResponse.data
  } catch (e) {
    throw e
  }
}
export interface AuthResponse {
  unauthenticatedUserIds: string[],
  authenticatedUserIds: string[]
  unlinkedSteamUserIds: string[]
}