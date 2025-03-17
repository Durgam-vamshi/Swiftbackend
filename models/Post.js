const { ObjectId } = require("mongodb");

const PostSchema = {
    _id: ObjectId,
    id: Number,
    userId: Number,
    title: String,
    body: String,
    comments: Array,
};

module.exports = PostSchema;



