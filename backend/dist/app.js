"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Bringing in all modules and packages that will be needed to ge thte server up and
 * running 💨
 */
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const lusca_1 = __importDefault(require("lusca"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helper_1 = __importDefault(require("./utils/config/helper"));
const compression_1 = __importDefault(require("compression"));
/**
 * Configure the app to take all keys saved in the .env file and make it accessible to the
 * application 🤫
 */
dotenv_1.default.config({ path: './config.env' });
const app = express_1.default();
// Preventing cors
app.use(cors_1.default());
// Set Security HTTP headers
app.use(helmet_1.default());
// Express configuration
app.set('port', process.env.PORT || 8080);
/**
 * Configure limit of request from the same IP address
 * Limit amount of request from the same IP address
 * 1000 requests / 1hr - just for development
 * TODO || you can change this if you prefer
 */
const limiter = express_rate_limit_1.default({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP address, please try again in an hour',
});
/**
 * Make use of the limit configuration just set above
 * This at least helps with DDos attack and brute force attack
 */
app.use('/api', limiter);
/**
 * These are neccessary to have, you can discard them for your personal app
 * OR look on the internet to see what this does for your app
 */
app.use(compression_1.default());
app.use(express_1.default.json({ limit: '10kb' }));
app.use(lusca_1.default.xframe('SAMEORIGIN'));
app.use(lusca_1.default.xssProtection(true));
/**
 * Data Sanitization against NoSql injection
 */
app.use(express_mongo_sanitize_1.default());
/**
 * Prevent parameter pollution
 */
app.use(hpp_1.default({
    whitelist: ['price', 'category'],
}));
/**
 * All ROUTES/ENDPOINTS WILL BE DEFINE
 */
app.use('/api/v1/tasks', (req, res) => {
    res.status(200).json({
        status: 'sucess',
    });
});
// global route error handler
app.all('*', (req, _, next) => {
    next(new helper_1.default.ApplicationError(`The requested endpoint: ${req.originalUrl} is not on this server`, 404));
});
/**
 * This will help us to handle all the errors that we might encounter
 * it will be called if the error is not handled by the above middlewares
 * and will provide us with a nice error message  😜😎
 */
app.use(helper_1.default.globalErrorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map