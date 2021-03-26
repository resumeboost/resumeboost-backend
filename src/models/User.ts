import bcrypt from 'bcrypt-nodejs';
import mongoose from 'mongoose';

export type UserDocument = mongoose.Document & {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  type: 'Customer' | 'Staff' | 'Admin';
  tokens: AuthToken[];
  comparePassword: ComparePasswordFunction;
};

// @ts-ignore
type ComparePasswordFunction = (
  candidatePassword: string,
  cb: (err: Error, isMatch: boolean) => void
) => void;

export interface AuthToken {
  accessToken: string;
  kind: string;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    phoneNumber: String,
    address: String,
    type: {
      type: String,
      enum: ['Customer', 'Staff', 'Admin'],
    },
    tokens: Array,
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this as UserDocument;

  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    // @ts-ignore
    bcrypt.hash(user.password, salt, undefined, (error, hash) => {
      if (error) {
        return next(error);
      }
      user.password = hash;
      // TODO: Check if returns cause problems
      return next();
    });
    return next();
  });
  return next();
});

// BUG: See if need to swap back to non-arrow function
// eslint-disable-next-line func-names
const comparePassword: ComparePasswordFunction = function (
  candidatePassword,
  cb
) {
  // @ts-ignore
  const user = this as UserDocument;
  bcrypt.compare(
    candidatePassword,
    user.password,
    (err: Error, isMatch: boolean) => {
      cb(err, isMatch);
    }
  );
};

userSchema.methods.comparePassword = comparePassword;

export const User = mongoose.model<UserDocument>('User', userSchema);
