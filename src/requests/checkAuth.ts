import axios from "axios"
import { config } from "../config"
// check auth
export async function checkAuth(userIds: string[]) {
  interface Response {
    unauthenticatedUserIds: string[],
    authenticatedUserIds: string[]
  }
  const response: Response = {
    unauthenticatedUserIds: [],
    authenticatedUserIds: []
  }
  await Promise.all(
    userIds.map(async (userId) => {
      const isUserAlreadyAuth = await axios.get(`${config.SERVER_IP}/checkauth?userId=${userId}`)
      if (isUserAlreadyAuth.data) {
        response.authenticatedUserIds.push(userId)
      } else {
        response.unauthenticatedUserIds.push(userId)
      }
    })
  )
  return response
}