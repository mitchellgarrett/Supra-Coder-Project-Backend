// Import dependencies
import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Initialize dotenv to use environment variables defined in .env file
dotenv.config();

// Initialize express server
const server = express();

// Force express to accept json
server.use(express.json());

// Use cors to prevent cross-site issues
/*server.use(
    cors({
        origin: [process.env.CLIENT_URL!],
    })
);*/

// Connect to mongo databse
mongoose
    .connect(process.env.MONGO_URL!)
    .then(() => console.log("Connected to database"))
    .catch(console.error);

// Import database schemas
import User from "./models/User";
import Item from "./models/Item";

// Default endpoint to show proof of life
server.get("/", (_req: Request, res: Response) => {
    return res.send("Inventory Manager Server");
});

//#region Database endpoints

//#region User endpoints

// Get all users
// *** for debugging purposes ***
server.get("/users", async (request, response) => {
    // Find all users in database
    const users = await User.find();

    // Return json to client
    response.json(users);
});

// Create new user with given data
server.post("/user/register", async (request, response) => {
    const { firstName, lastName, username, password } = request.body;

    // Check that username does not already exist
    const username_exists = await User.findOne({ username: username });
    if (username_exists)
        return response.json({
            error: "username is already taken",
        });

    if (username.length < 6)
        return response.json({
            error: "username should be at least 6 characters",
        });
    if (password.length < 6)
        return response.json({
            error: "password should be at least 6 characters",
        });

    const passwordHash = await getPasswordHash(password);

    // Create new user
    const user = new User({
        firstName: firstName,
        lastName: lastName,
        username: username,
        password: passwordHash,
    });

    // Save user to database
    user.save();

    // Return json to client
    response.json(user);
});

// Get a user given its username and password
server.post("/user/login", async (request, response) => {
    const { username, password } = request.body;

    const user = await User.findOne({ username: username });
    if (!user)
        return response.json({
            error: "user does not exist",
        });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
        return response.json({
            error: "incorrect password",
        });

    // Return json to client
    response.json(user);
});

// Get a user's username given its mongo id
server.get("/user/get/:id", async (request, response) => {
    const user = await User.findById(request.params.id);
    if (!user)
        return response.json({
            error: "user does not exist",
        });

    // Return json to client
    response.json({
        username: user.username,
    });
});

// Update a user's account details given its mongo id
server.post("/user/update/:id", async (request, response) => {
    const { firstName, lastName, username, password } = request.body;

    // Find user in database
    const user = await User.findById(request.params.id);
    if (!user)
        return response.json({
            error: "user does not exist",
        });

    // Update values if new values are provided
    if (!!firstName) user.firstName = firstName;
    if (!!lastName) user.lastName = lastName;
    if (!!username) user.username = username;
    if (!!password) user.password = password;

    // Save updated user to database
    user.save();

    // Return json to client
    response.json(user);
});

// Delete a user given its mongo id
server.delete("/user/delete/:id", async (request, response) => {
    // Delete user from database
    const user = await User.findByIdAndDelete(request.params.id);

    // Return json to client
    response.json(user);
});

//#endregion

//#region Item endpoints

// Get all items
server.get("/items", async (request, response) => {
    // Find all items in database
    const items = await Item.find();

    // Return json to client
    response.json(items);
});

// Get list of items belonging to user
server.get("/items/:id", async (request, response) => {
    // Find items in database with given userId
    const items = await Item.find({ userId: request.params.id });

    // Return json to client
    response.json(items);
});

// Create new item
server.post("/item/new", async (request, response) => {
    const { userId, itemName, description, quantity } = request.body;

    // Create new item
    const item = new Item({
        userId: userId,
        itemName: itemName,
        description: description,
        quantity: quantity,
    });

    // Save item to database
    item.save();

    // Return json to client
    response.json(item);
});

// Update an items's details given its mongo id
server.put("/item/update/:id", async (request, response) => {
    const { itemName, description, quantity } = request.body;

    // Find item in database
    const item = await Item.findById(request.params.id);
    if (!item)
        return response.json({
            error: "item does not exist",
        });

    // Update values if new values are provided
    if (!!itemName) item.itemName = itemName;
    if (!!description) item.description = description;
    if (!!quantity) item.quantity = quantity;

    // Save updated user to database
    item.save();

    // Return json to client
    response.json(item);
});

// Delete an item given its mongo id
server.delete("/item/delete/:id", async (request, response) => {
    // Delete item from database
    const item = await Item.findByIdAndDelete(request.params.id);

    // Return json to client
    response.json(item);
});

//#endregion

//#endregion

// ########### TODO ###############
// CHANGE THIS TO HASH ON THE CLIENT SO THE HTTP REQUESTS DONT HAVE THE PLAINTEXT PASSWORD

// Hash a password via bcrypt
const getPasswordHash = (password: string) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (error, salt) => {
            if (error) reject(error);
            bcrypt.hash(password, salt, (error, hash) => {
                if (error) reject(error);
                resolve(hash);
            });
        });
    });
};

// Start server on port
const port: String = process.env.SERVER_PORT!;
server.listen(port, () => console.log("Server started on port " + port));

export default server;
