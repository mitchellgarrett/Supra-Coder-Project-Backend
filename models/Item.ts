import mongoose, { Schema } from "mongoose";

const ItemSchema = new Schema({
    // MongoDB has built-in _id field
    userId: {
        type: String,
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    quantity: {
        type: Number,
        default: 1,
    },
});

const Item = mongoose.model("Item", ItemSchema);
export default Item;
