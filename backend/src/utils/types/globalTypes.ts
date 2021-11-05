// This is where all types will live
import { Document } from 'mongoose'

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

export type UserDocument = Document & {
  name?: string
  firstName: string
  lastName: string
  email: string
  password: string | undefined
  role: Role
  photo: string
  passwordConfirm: string | undefined
  active?: boolean
  passwordChangedAt: Date
  checkUser: (a: string, b: string) => boolean
  changedPasswordAfter: (a: number) => boolean
  createPasswordResetToken: () => string
  validatePassword: () => boolean
  passwordResetToken?: string | undefined
  passwordResetExpires?: number | undefined
}
