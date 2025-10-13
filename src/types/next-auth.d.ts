import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      rating?: number
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    rating?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    rating?: number
  }
}
