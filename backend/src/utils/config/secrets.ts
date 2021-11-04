import dotenv from 'dotenv'
import fs from 'fs'

import logger from './logger'

if (fs.existsSync('./config.env')) {
  logger.debug('Using .env file to supply config environment variables')
  dotenv.config({ path: './config.env' })
} else {
  logger.debug('Using .env.example file to supply config environment variables')
  dotenv.config({ path: '.env.example' }) // you can delete this after you create your own .env file!
}

export const ENVIRONMENT = process.env.NODE_ENV
const prod = ENVIRONMENT === 'production' // Anything else is treated as 'dev'

export const JWT_SECRET = process.env['JWT_SECRET'] as string
export const MONGODB_URI = process.env['MONGODB_URI'] as string
export const MONGODB_LOCAL = process.env['MONGODB_URI_LOCAL'] as string
export const DB_PASSWORD = process.env['MONGO_PASSWORD'] as string

if (!JWT_SECRET) {
  logger.error('No client secret. Set JWT_SECRET environment variable.')
  process.exit(1)
}

if (!MONGODB_URI) {
  if (prod) {
    logger.error('No mongo connection string. Set MONGODB_URI environment variable.')
  } else {
    logger.error(
      'No mongo connection string. Set MONGODB_URI_LOCAL environment variable.'
    )
  }
  process.exit(1)
}
