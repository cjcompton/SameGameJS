import axios from "axios"
import { config } from "src/config"
// check auth
export async function checkAuth(userIds: string[]) {
  interface Response {
    unauthenticatedUsers: string[],
    authenticatedUsers: string[]
  }
  const response: Response = {
    unauthenticatedUsers: [],
    authenticatedUsers: []
  }
  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const isUserAlreadyAuth = await axios.get(`${config.SERVER_IP}/checkauth?userId=${userId}`)
        if (isUserAlreadyAuth.data) {
          response.authenticatedUsers.push(userId)
        } else {
          response.unauthenticatedUsers.push(userId)
        }
      } catch (e) {
        throw e
      }
    })
  )
  return response
}