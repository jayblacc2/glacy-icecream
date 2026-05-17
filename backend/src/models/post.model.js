import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
      index: true,
    },

    // Excerpt / Summary (shown under title in card)
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      trim: true,
      maxlength: [200, "Excerpt cannot exceed 200 characters"],
    },

    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },

    author: {
      type: String,
      default: "Anonymous",
      trim: true,
      maxlength: [50, "Author name cannot exceed 50 characters"],
    },

    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    featuredImage: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v) || /^\/images\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid image URL or path!`,
      },
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

// Virtual: Format date as "Mar 16, 2023" for display
postSchema.virtual("formattedDate").get(function () {
  return this.publishedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});

postSchema.index({ title: "text", excerpt: "text" });

const Post = mongoose.model("Post", postSchema);
export default Post;
