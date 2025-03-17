const { ObjectId } = require("mongodb");

const CommentSchema = {
    _id: ObjectId,
    id: Number,
    postId: Number,
    name: String,
    email: String,
    body: String,
};

module.exports = CommentSchema;
