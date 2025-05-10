import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface IUserMethods {
  generateAuthToken(): Promise<string>;
  comparePassword(password: string): Promise<boolean>;
}

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 7
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Hash the password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  }
  next();
});

// Generate auth token
userSchema.methods.generateAuthToken = async function() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not set in environment variables');
    throw new Error('Server configuration error');
  }
  
  try {
    const token = jwt.sign(
      { 
        _id: this._id.toString(),
        email: this.email,
        role: this.role
      },
      secret,
      { expiresIn: '7d' }
    );
    return token;
  } catch (error) {
    console.error('Error generating auth token:', error);
    throw error;
  }
};

// Compare password
userSchema.methods.comparePassword = async function(password: string) {
  if (!password) {
    console.error('No password provided for comparison');
    return false;
  }
  
  if (!this.password) {
    console.error('No stored password found for user');
    return false;
  }

  try {
    const isMatch = await bcrypt.compare(password, this.password);
    console.log('Password comparison result:', { 
      isMatch,
      providedLength: password.length,
      storedLength: this.password.length
    });
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

const User = mongoose.model<IUser, UserModel>('User', userSchema);
export default User; 