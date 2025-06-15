import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

// Setup
neonConfig.webSocketConstructor = ws
const connectionString = `${process.env.DATABASE_URL}`

// Init prisma client
const adapter = new PrismaNeon({ connectionString })

export const prisma = new PrismaClient({ adapter })