import mongoose, {Schema} from 'mongoose';
import  type  { IUser } from '../types';

const userSchema = new Schema<IUser>(
    {
        name: {type: String, required: true },
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
    },
    { timestamps: true}

);

export default mongoose.model<IUser>('User', userSchema);
