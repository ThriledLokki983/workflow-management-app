"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Bringing in all modules and packages that will be needed to ge thte server up and
 * running 💨
 */
const errorhandler_1 = __importDefault(require("errorhandler"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const secrets_1 = require("./utils/secrets/secrets");
/**
 * This will use the url from the .env file and replace the <password> with the actual
 * password to allow MongoDB Atlas to grant us permission to connect to the
 * 'workflow' DB
 */
const DB = secrets_1.MONGODB_URI.replace('<password>', secrets_1.DB_PASSWORD);
let client;
/**
 * Connecting to the Database - this setup of for direct connection to Atlas
 * You can connect directly yo my Atlas DB if you promise not to mess it up 😉
 * You can always ping me for the url and the pswd for direct connection to the same DB
 */
mongoose_1.default
    .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
})
    .then(() => {
    console.log('DB CONNECTION SUCCESSFUL!!!');
    client = app_1.default.listen(app_1.default.get('port'), () => {
        console.log('  App is running at http://localhost:%d in %s mode', app_1.default.get('port'), app_1.default.get('env'));
        console.log('  Press CTRL-C to stop\n');
    });
})
    .catch((err) => {
    console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
    process.exit(1);
});
/**
 * There's always going to be an error we cannot or will miss and this little boy down
 * there will handle it for us. thats 🆒 right ???
 * Global Safety Net for all unhandled errors 🧨
 * Safely handling all other unhandled errors that may occur in any ASYNC
 * Code that we couldn't catch
 */
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION!: Shutting down.server..');
    console.log(err.name, err.message);
    client.close(() => {
        process.exit(1);
    });
});
/**
 * Error Handler. Provides full stack - remove for production
 */
app_1.default.use(errorhandler_1.default());
//# sourceMappingURL=server.js.map