import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
      max: 1000000,
      get: (v) => (v ? parseFloat(v.toString()) : v),
      set: (v) => (v ? mongoose.Types.Decimal128.fromString(v.toString()) : v),
    },
    image: {
      url: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        unique: true,
      },
      publicId: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
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
