/**
 * Bringing in all modules and packages that will be needed to ge thte server up and
 * running 💨
 */
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongosanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import lusca from 'lusca'
import dotenv from 'dotenv'
import cors from 'cors'
import helper from './utils/config/errorConfig'

import compression from 'compression'
import { NextFunction, Request, Response } from 'express'

/**
 * Configure the app to take all keys saved in the .env file and make it accessible to the
 * application 🤫
 */
dotenv.config({ path: './config.env' })
const app = express()

// Preventing cors
app.use(cors())

// Set Security HTTP headers
app.use(helmet())

// Express configuration
app.set('port', process.env.PORT || 8080)

/**
 * Configure limit of request from the same IP address
 * Limit amount of request from the same IP address
 * 1000 requests / 1hr - just for development
 * TODO || you can change this if you prefer
 */
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP address, please try again in an hour',
})

/**
 * Make use of the limit configuration just set above
 * This at least helps with DDos attack and brute force attack
 */
app.use('/api', limiter)

/**
 * These are neccessary to have, you can discard them for your personal app
 * OR look on the internet to see what this does for your app
 */
app.use(compression())
app.use(express.json({ limit: '10kb' }))
app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))

/**
 * Data Sanitization against NoSql injection
 */
app.use(mongosanitize())

/**
 * Prevent parameter pollution
 */
app.use(
  hpp({
    whitelist: ['price', 'category'],
  })
)

/**
 * All ROUTES/ENDPOINTS WILL BE DEFINE
 */
app.use('/api/v1/tasks', (req, res) => {
  res.status(200).json({
    status: 'sucess',
  })
})

// global route error handler
app.all('*', (req: Request, _: Response, next: NextFunction) => {
  next(
    new helper.ApplicationError(
      `The requested endpoint: ${req.originalUrl} is not on this server`,
      404
    )
  )
})

/**
 * This will help us to handle all the errors that we might encounter
 * it will be called if the error is not handled by the above middlewares
 * and will provide us with a nice error message  😜😎
 */
app.use(helper.globalErrorHandler)

export default app
