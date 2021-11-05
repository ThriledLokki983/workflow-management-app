"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const secrets_1 = require("./utils/config/secrets");
const errorConfig_1 = __importDefault(require("./utils/config/errorConfig"));
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
 * Take these steps to make sure that the server is shut down gracefully
 */
process.on('uncaughtException', errorConfig_1.default.handleUncaughtException);
process.on('unhandledRejection', errorConfig_1.default.handleRejectedPromise);
process.on('SIGINT', errorConfig_1.default.closeMongoConnection);
//# sourceMappingURL=server.js.map