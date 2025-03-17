// const axios = require("axios");

// async function loadUsers(req, res) {
//     try {
//         const db = await require("../config/db")();
//         const usersCollection = db.collection("users");
//         const postsCollection = db.collection("posts");
//         const commentsCollection = db.collection("comments");

//         // Fetch Users
//         const { data: users } = await axios.get("https://jsonplaceholder.typicode.com/users");

//         for (const user of users) {
//             const { data: posts } = await axios.get(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`);
//             for (const post of posts) {
//                 const { data: comments } = await axios.get(`https://jsonplaceholder.typicode.com/comments?postId=${post.id}`);
//                 post.comments = comments;
//                 await commentsCollection.insertMany(comments);
//             }
//             user.posts = posts;
//             await postsCollection.insertMany(posts);
//         }

//         await usersCollection.insertMany(users);
//         res.status(200).send();
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

// async function deleteAllUsers(req, res) {
//     try {
//         const db = await require("../config/db")();
//         await db.collection("users").deleteMany({});
//         await db.collection("posts").deleteMany({});
//         await db.collection("comments").deleteMany({});
//         res.status(200).json({ message: "All users deleted!" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

// async function deleteUser(req, res) {
//     try {
//         const userId = parseInt(req.params.userId);
//         const db = await require("../config/db")();
//         await db.collection("users").deleteOne({ id: userId });
//         await db.collection("posts").deleteMany({ userId });
//         await db.collection("comments").deleteMany({ postId: userId });
//         res.status(200).json({ message: `User ${userId} deleted!` });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

// async function getUserById(req, res) {
//     try {
//         const userId = parseInt(req.params.userId);
//         const db = await require("../config/db")();
//         const user = await db.collection("users").findOne({ id: userId });

//         if (!user) return res.status(404).json({ error: "User not found" });

//         const posts = await db.collection("posts").find({ userId }).toArray();
//         for (const post of posts) {
//             post.comments = await db.collection("comments").find({ postId: post.id }).toArray();
//         }
//         user.posts = posts;

//         res.status(200).json(user);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

// async function addUser(req, res) {
//     try {
//         const db = await require("../config/db")();
//         const user = req.body;
        
//         const existingUser = await db.collection("users").findOne({ id: user.id });
//         if (existingUser) return res.status(409).json({ error: "User already exists" });

//         await db.collection("users").insertOne(user);
//         res.status(201).json({ message: "User added!" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

// module.exports = { loadUsers, deleteAllUsers, deleteUser, getUserById, addUser };











const axios = require("axios");

async function loadUsers(req, res) {
    try {
        const db = await require("../config/db")();
        const usersCollection = db.collection("users");
        const postsCollection = db.collection("posts");
        const commentsCollection = db.collection("comments");

        console.log("Fetching users...");
        const { data: users } = await axios.get("https://jsonplaceholder.typicode.com/users");
        console.log("Users fetched:", users.length);

        console.log("Fetching posts...");
        const postsPromises = users.map(user => axios.get(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`));
        const postsResponses = await Promise.all(postsPromises);
        const posts = postsResponses.flatMap(res => res.data);
        console.log("Posts fetched:", posts.length);

        console.log("Fetching comments...");
        const commentsPromises = posts.map(post => axios.get(`https://jsonplaceholder.typicode.com/comments?postId=${post.id}`));
        const commentsResponses = await Promise.all(commentsPromises);
        const comments = commentsResponses.flatMap(res => res.data);
        console.log("Comments fetched:", comments.length);

        console.log("Inserting data into database...");
        await usersCollection.insertMany(users);
        await postsCollection.insertMany(posts);
        await commentsCollection.insertMany(comments);
        console.log("Data inserted successfully!");

        res.status(200).json({ message: "Data successfully loaded!" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}

async function deleteAllUsers(req, res) {
    try {
        const db = await require("../config/db")();
        console.log("Deleting all users, posts, and comments...");
        await Promise.all([
            db.collection("users").deleteMany({}),
            db.collection("posts").deleteMany({}),
            db.collection("comments").deleteMany({})
        ]);
        console.log("All users, posts, and comments deleted!");
        res.status(200).json({ message: "All users deleted!" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}

async function deleteUser(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const db = await require("../config/db")();
        
        console.log(`Fetching posts for user ${userId} before deletion...`);
        const posts = await db.collection("posts").find({ userId }).toArray();
        const postIds = posts.map(post => post.id);
        console.log(`Found ${posts.length} posts for user ${userId}`);
        
        console.log(`Deleting user ${userId} and associated posts/comments...`);
        await Promise.all([
            db.collection("users").deleteOne({ id: userId }),
            db.collection("posts").deleteMany({ userId }),
            db.collection("comments").deleteMany({ postId: { $in: postIds } })
        ]);
        console.log(`User ${userId} deleted successfully!`);

        res.status(200).json({ message: `User ${userId} deleted!` });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}

async function getUserById(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const db = await require("../config/db")();
        console.log(`Fetching user ${userId}...`);
        const user = await db.collection("users").findOne({ id: userId });

        if (!user) {
            console.log("User not found!");
            return res.status(404).json({ error: "User not found" });
        }

        console.log(`Fetching posts for user ${userId}...`);
        const posts = await db.collection("posts").find({ userId }).toArray();
        const postIds = posts.map(post => post.id);

        console.log(`Fetching comments for ${postIds.length} posts...`);
        const comments = await db.collection("comments").find({ postId: { $in: postIds } }).toArray();

        console.log("Attaching comments to posts...");
        posts.forEach(post => {
            post.comments = comments.filter(comment => comment.postId === post.id);
        });
        user.posts = posts;

        console.log(`Returning data for user ${userId}`);
        res.status(200).json(user);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}

async function addUser(req, res) {
    try {
        const db = await require("../config/db")();
        const user = req.body;
        console.log(`Checking if user ${user.id} already exists...`);
        
        const existingUser = await db.collection("users").findOne({ id: user.id });
        if (existingUser) {
            console.log("User already exists!");
            return res.status(409).json({ error: "User already exists" });
        }
        
        console.log("Adding new user...");
        await db.collection("users").insertOne(user);
        console.log("User added successfully!");
        res.status(201).json({ message: "User added!" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { loadUsers, deleteAllUsers, deleteUser, getUserById, addUser };



