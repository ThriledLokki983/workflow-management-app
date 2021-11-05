"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_CALLBACK_URL = exports.GOOGLE_CLIENT_SECRET = exports.GOOGLE_CLIENT_ID = exports.DB_PASSWORD = exports.MONGODB_LOCAL = exports.MONGODB_URI = exports.JWT_SECRET = exports.ENVIRONMENT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("./logger"));
if (fs_1.default.existsSync('./config.env')) {
    logger_1.default.debug('Using .env file to supply config environment variables');
    dotenv_1.default.config({ path: './config.env' });
}
else {
    logger_1.default.debug('Using .env.example file to supply config environment variables');
    dotenv_1.default.config({ path: '.env.example' }); // you can delete this after you create your own .env file!
}
exports.ENVIRONMENT = process.env.NODE_ENV;
const prod = exports.ENVIRONMENT === 'production'; // Anything else is treated as 'dev'
exports.JWT_SECRET = process.env['JWT_SECRET'];
exports.MONGODB_URI = process.env['MONGODB_URI'];
exports.MONGODB_LOCAL = process.env['MONGODB_URI_LOCAL'];
exports.DB_PASSWORD = process.env['MONGO_PASSWORD'];
exports.GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'];
exports.GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'];
exports.GOOGLE_CALLBACK_URL = process.env['GOOGLE_CALLBACK_URL'];
if (!exports.JWT_SECRET) {
    logger_1.default.error('No client secret. Set JWT_SECRET environment variable.');
    process.exit(1);
}
if (!exports.MONGODB_URI) {
    if (prod) {
        logger_1.default.error('No mongo connection string. Set MONGODB_URI environment variable.');
    }
    else {
        logger_1.default.error('No mongo connection string. Set MONGODB_URI_LOCAL environment variable.');
    }
    process.exit(1);
}
//# sourceMappingURL=secrets.js.map