import { Schema, model } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { UserDocument, Role } from '../utils/types/globalTypes'

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
    },
    firstName: {
      type: String,
      required: [true, 'A User must have a firstName'],
    },
    lastName: {
      type: String,
      required: [true, 'A User must have a lastName'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: [true, 'Email already exist'],
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: Number,
      enum: [Role.ADMIN, Role.GUEST, Role.USER],
      default: Role.USER,
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minLength: [8, 'Password should be at least 8 characters'],
      select: false,
    },
    // handle this using a middleware before creation of the user object
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  // Help show a field that is not stored in the DB but calc using some other values
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

/**
 * MIDDLEWARE FOR PASSWORD HASHING
 * If password is modified, we run this code below
 * Hash the password with cost of 12
 * Then and only then we can delete the passwordConfirm
 */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password!, 14)

  this.name = this.firstName + ' ' + this.lastName

  this.passwordConfirm = undefined
  next()
})

/**
 * This updates the passwordChangedAt when password is reset by the
 * user
 */
UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next()
  this.passwordChangedAt = new Date(Date.now() - 1000)
  next()
})

/**
 * QUERY MIDDLEWARE
 */
UserSchema.pre(/^find/, function (next) {
  // this.find({ active: { $ne: false } })
  next()
})

/**
 * This checks to see if user entered the same value for both the password
 * and the passwordCOnfirm field
 * @returns Boolean
 */
UserSchema.methods.validatePassword = function () {
  return this.password === this.passwordConfirm
}

/**
 * INSTANCE METHOD ON THE SCHEMA
 * This function returns true if the password provided by the user and the one
 * stored in the DB are indeed the same
 * @param passwordProvided | String
 * @param passwordHashed | String
 * @returns {Boolean} | True if passwordProvided === passwordHashed (DB)
 */
UserSchema.methods.checkUser = async function (
  passwordProvided: string,
  passwordHashed: string
) {
  return await bcrypt.compare(passwordProvided, passwordHashed)
}

/**
 * This function takes in a timestamp: Date and compares it to the timestamp
 * provied during the time this user changed the password
 * @param {Number} | JWTtimestamp
 * @returns {Boolean}
 */
UserSchema.methods.changedPasswordAfter = function (JWTtimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const date = this.passwordChangedAt.getTime()
    const changeTimeStamp = date / 1000
    return JWTtimestamp < changeTimeStamp
  }
  return false
}

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  crypto.createHash('sha256').update(resetToken).digest('hex')

  this.passwordResetExpires = Date.now() + 30 * 60 * 1000

  return resetToken
}

export default model<UserDocument>('User', UserSchema)
