import passport from 'passport'
import User from '../../models/userModel'
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } from './secrets'
const FacebookStrategy = require('passport-facebook').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const GithubStrategy = require('passport-github').Strategy
const LocalStrategy = require('passport-local').Strategy
const MicrosoftStrategy = require('passport-microsoft').Strategy
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
const AppleStrategy = require('passport-apple').Strategy
const OpenIDStrategy = require('passport-openid').Strategy
const SlackStrategy = require('passport-slack').Strategy
const SpotifyStrategy = require('passport-spotify').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

// create the JWT strategy for signing in
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
}

passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload: any, done: any) => {
    try {
      const user = await User.findById(jwt_payload.sub)
      if (user) {
        return done(null, user)
      }
      return done(null, false)
    } catch (error) {
      return done(error, false)
    }
  })
)

// sign in with openid
passport.use(
  new OpenIDStrategy(
    {
      name: 'openid',
      returnURL: process.env.OPENID_RETURN_URL,
      realm: process.env.OPENID_REALM,
      profile: true,
      passReqToCallback: true,
    },
    async (req: any, identifier: any, profile: any, done: any) => {
      try {
        const user = await User.findOne({ openid: identifier })
        if (!user) {
          const newUser = new User({
            openid: identifier,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
          })
          const savedUser = await newUser.save()
          return done(null, savedUser)
        }
        return done(null, user)
      } catch (error) {
        return done(error, false)
      }
    }
  )
)

// sign in with slack
passport.use(
  new SlackStrategy(
    {
      clientID: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      callbackURL: process.env.SLACK_CALLBACK_URL,
      scope: ['identity.basic', 'identity.email', 'identity.avatar'],
      passReqToCallback: true,
    },
    async (req: any, accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        const user = await User.findOne({ 'slack.id': profile.id })
        if (user) {
          return done(null, user)
        }
        const newUser = new User({
          method: 'slack',
          slack: {
            id: profile.id,
            email: profile.email,
            name: profile.displayName,
            avatar: profile._json.user.profile.image_192,
          },
        })
        await newUser.save()
        return done(null, newUser)
      } catch (error) {
        return done(error, false)
      }
    }
  )
)

// sign in with spotify
passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: process.env.SPOTIFY_CALLBACK_URL,
    },
    async (
      accessToken: any,
      refreshToken: any,
      expires_in: any,
      profile: any,
      done: any
    ) => {
      try {
        const existingUser = await User.findOne({ spotifyId: profile.id })
        if (existingUser) {
          return done(null, existingUser)
        }
        const newUser = await new User({
          spotifyId: profile.id,
          spotifyAccessToken: accessToken,
          spotifyRefreshToken: refreshToken,
          spotifyExpiresIn: expires_in,
          spotifyDisplayName: profile.displayName,
          spotifyEmail: profile.emails[0].value,
          spotifyProfileUrl: profile.profileUrl,
          spotifyImageUrl: profile.photos[0].value,
        }).save()
        return done(null, newUser)
      } catch (error) {
        return done(error, false)
      }
    }
  )
)

/**
 * Sign in with Google.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // find the user in the database
        const user = await User.findOne({ _id: profile.id })
        // if the user does not exist, create a new user
        if (!user) {
          const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          })
          done(null, newUser)
        } else {
          done(null, user)
        }
      } catch (err) {
        done(err, false)
      }
    }
  )
)

/**
 * Sign in with GitHub.
 */
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // find the user in the database
        const user = await User.findOne({ _id: profile.id })
        // if the user does not exist, create a new user
        if (!user) {
          const newUser = await User.create({
            githubId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          })
          done(null, newUser)
        } else {
          done(null, user)
        }
      } catch (err) {
        done(err, false)
      }
    }
  )
)

/**
 * Sign in with Facebook.
 */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // find the user in the database
        const user = await User.findOne({ _id: profile.id })
        // if the user does not exist, create a new user
        if (!user) {
          const newUser = await User.create({
            facebookId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          })
          done(null, newUser)
        } else {
          done(null, user)
        }
      } catch (err) {
        done(err, false)
      }
    }
  )
)

// sign in with Microsoft
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_APP_ID,
      clientSecret: process.env.MICROSOFT_APP_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // find the user in the database

        const user = await User.findOne({ _id: profile.id })
        // if the user does not exist, create a new user
        if (!user) {
          const newUser = await User.create({
            microsoftId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          })
          done(null, newUser)
        } else {
          done(null, user)
        }
      } catch (err) {
        done(err, false)
      }
    }
  )
)

// sign in with LinkedIn
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_APP_ID,
      clientSecret: process.env.LINKEDIN_APP_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL,
      scope: ['r_emailaddress', 'r_liteprofile'],
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // find the user in the database
        const user = await User.findOne({ _id: profile.id })
        // if the user does not exist, create a new user
        if (!user) {
          const newUser = await User.create({
            linkedinId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          })
          done(null, newUser)
        } else {
          done(null, user)
        }
      } catch (err) {
        done(err, false)
      }
    }
  )
)

// sing in with Twitter
passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL,
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // find the user in the database
        const user = await User.findOne({ _id: profile.id })
        // if the user does not exist, create a new user
        if (!user) {
          const newUser = await User.create({
            twitterId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          })

          done(null, newUser)
        } else {
          done(null, user)
        }
      } catch (err) {
        done(err, false)
      }
    }
  )
)

// sign in with Apple
passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
      callbackURL: process.env.APPLE_CALLBACK_URL,
      scope: ['email'],
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // find the user in the database
        const user = await User.findOne({ _id: profile.id })
        // if the user does not exist, create a new user
        if (!user) {
          const newUser = await User.create({
            appleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          })
          done(null, newUser)
        } else {
          done(null, user)
        }
      } catch (err) {
        done(err, false)
      }
    }
  )
)

/**
 * Sign in with email and password.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email: string, password: string, done: any) => {
      try {
        // find the user in the database
        const user = await User.findOne({ email })
        // if the user does not exist, return false
        if (!user) {
          return done(null, false)
        }
        // if the password is incorrect, return false
        if (!user.checkUser(password, user.password!)) {
          return done(null, false)
        }
        // return the user
        return done(null, user)
      } catch (err) {
        return done(err, false)
      }
    }
  )
)
