"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const secrets_1 = require("./secrets");
// a function to handle rejected promises
const handleRejectedPromise = (reason, promise) => {
    console.error('Unexpected exception occurred: ', { reason, ex: promise });
    process.exit(1);
};
// a function to handle uncaught exceptions
const handleUncaughtException = (err) => {
    console.error('UNCAUGHT EXCEPTION!: Shutting down.server.. ', err);
    process.exit(1);
};
// close mongodb connection
const closeMongoConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connection.close();
        shutDownServer();
    }
    catch (err) {
        console.error('Error occurred while closing mongo connection: ', err);
        process.exit(1);
    }
});
// shut down server completly
const shutDownServer = () => {
    setTimeout(() => {
        console.log('Shutting down process completely');
        process.abort();
    }, 1000).unref();
};
// Create an error handler
class ApplicationError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        // set the name of the error to be the same as the class name
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
// DEVELOPMENT ERROR HANDLING
const developmentErrorHandler = (err, req, res) => {
    // Show as much info as possible to the the developer in development mode
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
    });
};
// PRODUCTION ERROR HANDLING
const productionErrorHandler = (err, req, res) => {
    // Show as only relevant info to the user in production mode
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
        });
    }
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message,
        });
    }
    // 2) Send generic message to client
    return res.status(err.statusCode).render('error', {
        title: 'Something is not right',
        msg: 'Please try again later',
    });
};
// GLOBAL ERROR HANDLING
const globalErrorHandler = (err, req, res, _) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (secrets_1.ENVIRONMENT === 'development') {
        // DEVELOPMENT ERROR HANDLING
        developmentErrorHandler(err, req, res);
    }
    else if (secrets_1.ENVIRONMENT === 'production') {
        // PRODUCTION ERROR HANDLING
        productionErrorHandler(err, req, res);
    }
};
exports.default = {
    handleRejectedPromise,
    closeMongoConnection,
    handleUncaughtException,
    shutDownServer,
    ApplicationError,
    globalErrorHandler,
};
//# sourceMappingURL=helper.js.map