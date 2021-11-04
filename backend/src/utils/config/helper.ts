import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
import { ENVIRONMENT } from './secrets'

// a function to handle rejected promises
const handleRejectedPromise = (reason: any, promise: Promise<any>): void => {
  console.error('Unexpected exception occurred: ', { reason, ex: promise })
  process.exit(1)
}

// a function to handle uncaught exceptions
const handleUncaughtException = (err: Error): void => {
  console.error('UNCAUGHT EXCEPTION!: Shutting down.server.. ', err)
  process.exit(1)
}

// close mongodb connection
const closeMongoConnection = async (): Promise<void> => {
  try {
    await mongoose.connection.close()
    shutDownServer()
  } catch (err) {
    console.error('Error occurred while closing mongo connection: ', err)
    process.exit(1)
  }
}

// shut down server completly
const shutDownServer = (): void => {
  setTimeout(() => {
    console.log('Shutting down process completely')
    process.abort()
  }, 1000).unref()
}

// Create an error handler

class ApplicationError extends Error {
  // this is to separate programming error from operational errors
  public isOperational: boolean
  public status: string

  constructor(public message: string, public statusCode: number) {
    super(message)
    // set the name of the error to be the same as the class name
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// DEVELOPMENT ERROR HANDLING
const developmentErrorHandler = (err: ApplicationError, req: Request, res: Response) => {
  // Show as much info as possible to the the developer in development mode
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    })
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  })
}

// PRODUCTION ERROR HANDLING
const productionErrorHandler = (err: ApplicationError, req: Request, res: Response) => {
  // Show as only relevant info to the user in production mode
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      })
    }

    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    })
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    })
  }

  // 2) Send generic message to client
  return res.status(err.statusCode).render('error', {
    title: 'Something is not right',
    msg: 'Please try again later',
  })
}

// GLOBAL ERROR HANDLING
const globalErrorHandler = (
  err: ApplicationError,
  req: Request,
  res: Response,
  _: NextFunction
): void => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (ENVIRONMENT === 'development') {
    // DEVELOPMENT ERROR HANDLING
    developmentErrorHandler(err, req, res)
  } else if (ENVIRONMENT === 'production') {
    // PRODUCTION ERROR HANDLING
    productionErrorHandler(err, req, res)
  }
}

export default {
  handleRejectedPromise,
  closeMongoConnection,
  handleUncaughtException,
  shutDownServer,
  ApplicationError,
  globalErrorHandler,
}
