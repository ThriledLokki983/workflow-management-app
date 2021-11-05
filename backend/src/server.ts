/**
 * Bringing in all modules and packages that will be needed
 * to get the server up and
 * running 💨
 */
import errorHandler from 'errorhandler'
import mongoose from 'mongoose'
import app from './app'
import { MONGODB_URI, DB_PASSWORD } from './utils/config/secrets'
import help from './utils/config/errorConfig'

/**
 * This will use the url from the .env file and replace the <password> with the actual
 * password to allow MongoDB Atlas to grant us permission to connect to the
 * 'workflow' DB
 */
const DB = MONGODB_URI.replace('<password>', DB_PASSWORD)
let client: any

/**
 * Connecting to the Database - this setup of for direct connection to Atlas
 * You can connect directly yo my Atlas DB if you promise not to mess it up 😉
 * You can always ping me for the url and the pswd for direct connection to the same DB
 */
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('DB CONNECTION SUCCESSFUL!!!')
    client = app.listen(app.get('port'), () => {
      console.log(
        '  App is running at http://localhost:%d in %s mode',
        app.get('port'),
        app.get('env')
      )
      console.log('  Press CTRL-C to stop\n')
    })
  })
  .catch((err: Error) => {
    console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err)
    process.exit(1)
  })

/**
 * There's always going to be an error we cannot or will miss and this little boy down
 * there will handle it for us. thats 🆒 right ???
 * Global Safety Net for all unhandled errors 🧨
 * Safely handling all other unhandled errors that may occur in any ASYNC
 * Code that we couldn't catch
 * Take these steps to make sure that the server is shut down gracefully
 */
process.on('uncaughtException', help.handleUncaughtException)
process.on('unhandledRejection', help.handleRejectedPromise)
process.on('SIGINT', help.closeMongoConnection)
