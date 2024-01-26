import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    // MongoDB has built-in _id field
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

const User = mongoose.model("User", UserSchema);
export default User;
