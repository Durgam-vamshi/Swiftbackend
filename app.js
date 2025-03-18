const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); 
const userRoutes = require("./routes/userRoutes"); 

dotenv.config();

const app = express();
app.use(express.json());

(async () => {
    try {
        const db = await connectDB(); 
        app.locals.db = db; 

        app.get("/", (req, res) => {
            res.send("Hi, I am Vamshi. This is my Node.js project for Swift backend.");
        });

        app.use("/api", userRoutes);

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Server failed to start:", error.message);
        process.exit(1);
    }
})();
