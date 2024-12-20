const mongoose = require("mongoose");


const replySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  created_on: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reported: {
    type: Boolean,
    default: false,
  },
  delete_password: {
    type: String,
    required: true,
  },
});


const threadSchema = new mongoose.Schema({
  board: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  created_on: {
    type: Date,
    required: true,
    default: Date.now,
  },
  bumped_on: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reported: {
    type: Boolean,
    default: false,
  },
  delete_password: {
    type: String,
    required: true,
  },
  replies: [replySchema],
});

threadSchema.index({ board: 1, bumped_on: -1 });


const Thread = mongoose.model("Thread", threadSchema);
const Reply = mongoose.model("Reply", replySchema);


const getThreadId = async (text = "test", delete_password = "test") => {
  try {
    let thread = await Thread.findOne({ text, delete_password });

    if (!thread) {
      thread = await Thread.create({
        board: "test",
        text,
        delete_password,
        replies: [],
      });
    }

    return thread;
  } catch (err) {
    console.error("Error fetching or creating thread:", err.message);
    throw new Error("Failed to fetch or create thread");
  }
};

const getReplyId = async (thread_id) => {
  try {
    const thread = await Thread.findById(thread_id);

    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.replies.length === 0) {
      const reply = new Reply({
        text: "test",
        created_on: Date.now(),
        reported: false,
        delete_password: "test",
      });

      thread.replies.push(reply);
      await thread.save();

      return reply; // Return the newly created reply
    }

    return thread.replies[0]; // Return the first existing reply
  } catch (err) {
    console.error("Error fetching or creating reply:", err.message);
    throw new Error("Failed to fetch or create reply");
  }
};

module.exports = { Thread, Reply, getThreadId, getReplyId };
