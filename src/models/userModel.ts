import { Schema, Types, model, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
interface IUser {
  username: string;
  email: string;
  password: string;
  avatar: string;
  adminId: Types.ObjectId;
  refreshToken: string;
}
interface IUserMethods {
  isPasswordCorrect(enteredPassword: string): Promise<boolean>;
  generateRefreshToken(): string;
  generateAccessToken(): string;
  isAdmin(): boolean;
}
type UserModel = Model<IUser, {}, IUserMethods>;
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      lowercase: true,
      trim: true,
      max: [20, 'username must be less than 20 characters'],
      required: [true, 'username is required'],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      max: [50, 'email must be less than 50 characters'],
      required: [true, 'email is required'],
    },
    password: {
      type: String,
      required: [true, 'password is required'],
    },
    avatar: {
      type: String, //cloudinary url
      default: 'https://picsum.photos/200/300',
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (
  enteredPassword: string,
) {
  const match = await bcrypt.compare(enteredPassword, this.password);
  return match;
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        ? Number(process.env.REFRESH_TOKEN_EXPIRY)
        : undefined,
    },
  );
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        ? Number(process.env.REFRESH_TOKEN_EXPIRY)
        : undefined,
    },
  );
};
userSchema.methods.isAdmin = function () {
  return this.adminId ? true : false;
};
const User = model<IUser, UserModel>('User', userSchema);

export default User;
