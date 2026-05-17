import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: 1000000,

    },
    image: {
      url: {
        type: String,
        required: false,
        trim: true,
      },
      publicId: {
        type: String,
        required: false,
        trim: true,
      },
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: [
        "candy",
        "caramel",
        "chocolate",
        "classic",
        "dessert",
        "fruit",
        "nut",
        "mint",
      ],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
    toObject: { getters: true },
  },
);

// Add index on category for faster queries
ProductSchema.index({ category: 1 });

const Product = mongoose.model("Product", ProductSchema);

export default Product;
