import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false, unique: false },
});

export default mongoose.model('User', userSchema);
