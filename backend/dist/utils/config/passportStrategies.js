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
const passport_1 = __importDefault(require("passport"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const secrets_1 = require("./secrets");
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GithubStrategy = require('passport-github').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const OpenIDStrategy = require('passport-openid').Strategy;
const SlackStrategy = require('passport-slack').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
// create the JWT strategy for signing in
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
};
passport_1.default.use(new JwtStrategy(jwtOptions, (jwt_payload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(jwt_payload.sub);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    }
    catch (error) {
        return done(error, false);
    }
})));
// sign in with openid
passport_1.default.use(new OpenIDStrategy({
    name: 'openid',
    returnURL: process.env.OPENID_RETURN_URL,
    realm: process.env.OPENID_REALM,
    profile: true,
    passReqToCallback: true,
}, (req, identifier, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findOne({ openid: identifier });
        if (!user) {
            const newUser = new userModel_1.default({
                openid: identifier,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
            });
            const savedUser = yield newUser.save();
            return done(null, savedUser);
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
})));
// sign in with slack
passport_1.default.use(new SlackStrategy({
    clientID: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    callbackURL: process.env.SLACK_CALLBACK_URL,
    scope: ['identity.basic', 'identity.email', 'identity.avatar'],
    passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findOne({ 'slack.id': profile.id });
        if (user) {
            return done(null, user);
        }
        const newUser = new userModel_1.default({
            method: 'slack',
            slack: {
                id: profile.id,
                email: profile.email,
                name: profile.displayName,
                avatar: profile._json.user.profile.image_192,
            },
        });
        yield newUser.save();
        return done(null, newUser);
    }
    catch (error) {
        return done(error, false);
    }
})));
// sign in with spotify
passport_1.default.use(new SpotifyStrategy({
    clientID: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    callbackURL: process.env.SPOTIFY_CALLBACK_URL,
}, (accessToken, refreshToken, expires_in, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield userModel_1.default.findOne({ spotifyId: profile.id });
        if (existingUser) {
            return done(null, existingUser);
        }
        const newUser = yield new userModel_1.default({
            spotifyId: profile.id,
            spotifyAccessToken: accessToken,
            spotifyRefreshToken: refreshToken,
            spotifyExpiresIn: expires_in,
            spotifyDisplayName: profile.displayName,
            spotifyEmail: profile.emails[0].value,
            spotifyProfileUrl: profile.profileUrl,
            spotifyImageUrl: profile.photos[0].value,
        }).save();
        return done(null, newUser);
    }
    catch (error) {
        return done(error, false);
    }
})));
/**
 * Sign in with Google.
 */
passport_1.default.use(new GoogleStrategy({
    clientID: secrets_1.GOOGLE_CLIENT_ID,
    clientSecret: secrets_1.GOOGLE_CLIENT_SECRET,
    callbackURL: secrets_1.GOOGLE_CALLBACK_URL,
}, (_accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // find the user in the database
        const user = yield userModel_1.default.findOne({ _id: profile.id });
        // if the user does not exist, create a new user
        if (!user) {
            const newUser = yield userModel_1.default.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
            });
            done(null, newUser);
        }
        else {
            done(null, user);
        }
    }
    catch (err) {
        done(err, false);
    }
})));
/**
 * Sign in with GitHub.
 */
passport_1.default.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // find the user in the database
        const user = yield userModel_1.default.findOne({ _id: profile.id });
        // if the user does not exist, create a new user
        if (!user) {
            const newUser = yield userModel_1.default.create({
                githubId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
            });
            done(null, newUser);
        }
        else {
            done(null, user);
        }
    }
    catch (err) {
        done(err, false);
    }
})));
/**
 * Sign in with Facebook.
 */
passport_1.default.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'photos', 'email'],
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // find the user in the database
        const user = yield userModel_1.default.findOne({ _id: profile.id });
        // if the user does not exist, create a new user
        if (!user) {
            const newUser = yield userModel_1.default.create({
                facebookId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
            });
            done(null, newUser);
        }
        else {
            done(null, user);
        }
    }
    catch (err) {
        done(err, false);
    }
})));
// sign in with Microsoft
passport_1.default.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_APP_ID,
    clientSecret: process.env.MICROSOFT_APP_SECRET,
    callbackURL: process.env.MICROSOFT_CALLBACK_URL,
    scope: ['profile', 'email'],
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // find the user in the database
        const user = yield userModel_1.default.findOne({ _id: profile.id });
        // if the user does not exist, create a new user
        if (!user) {
            const newUser = yield userModel_1.default.create({
                microsoftId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
            });
            done(null, newUser);
        }
        else {
            done(null, user);
        }
    }
    catch (err) {
        done(err, false);
    }
})));
// sign in with LinkedIn
passport_1.default.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_APP_ID,
    clientSecret: process.env.LINKEDIN_APP_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL,
    scope: ['r_emailaddress', 'r_liteprofile'],
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // find the user in the database
        const user = yield userModel_1.default.findOne({ _id: profile.id });
        // if the user does not exist, create a new user
        if (!user) {
            const newUser = yield userModel_1.default.create({
                linkedinId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
            });
            done(null, newUser);
        }
        else {
            done(null, user);
        }
    }
    catch (err) {
        done(err, false);
    }
})));
// sing in with Twitter
passport_1.default.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // find the user in the database
        const user = yield userModel_1.default.findOne({ _id: profile.id });
        // if the user does not exist, create a new user
        if (!user) {
            const newUser = yield userModel_1.default.create({
                twitterId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
            });
            done(null, newUser);
        }
        else {
            done(null, user);
        }
    }
    catch (err) {
        done(err, false);
    }
})));
// sign in with Apple
passport_1.default.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    clientSecret: process.env.APPLE_CLIENT_SECRET,
    callbackURL: process.env.APPLE_CALLBACK_URL,
    scope: ['email'],
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // find the user in the database
        const user = yield userModel_1.default.findOne({ _id: profile.id });
        // if the user does not exist, create a new user
        if (!user) {
            const newUser = yield userModel_1.default.create({
                appleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
            });
            done(null, newUser);
        }
        else {
            done(null, user);
        }
    }
    catch (err) {
        done(err, false);
    }
})));
/**
 * Sign in with email and password.
 */
passport_1.default.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // find the user in the database
        const user = yield userModel_1.default.findOne({ email });
        // if the user does not exist, return false
        if (!user) {
            return done(null, false);
        }
        // if the password is incorrect, return false
        if (!user.checkUser(password, user.password)) {
            return done(null, false);
        }
        // return the user
        return done(null, user);
    }
    catch (err) {
        return done(err, false);
    }
})));
//# sourceMappingURL=passportStrategies.js.map