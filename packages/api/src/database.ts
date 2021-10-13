
import type { ObjectId } from 'mongodb'

export interface ExternalUser { id: string, name: string, platform: string }

export interface MongoAccount {
  _id: ObjectId
  pronouns?: string
  accounts: ExternalUser[]
}
