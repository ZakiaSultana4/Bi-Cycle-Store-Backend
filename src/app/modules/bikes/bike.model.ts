import { model, Schema } from 'mongoose';
import { IBike } from './bike.interface';

const bikeSchema = new Schema<IBike>(
  {
    image: {
      type: [String], // change from String to array of strings
      required: [true, 'At least one image is required'],
      validate: {
        validator: function (val: string[]) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'Image array must have at least one image',
      },
    },
    name: { type: String, trim: true, required: [true, 'Name is Required'] },
    brand: {
      type: String,
      trim: true,
      required: [true, 'Brand name is Required!!'],
    },
    price: {
      type: Number,
      min: [0, 'It can not be less than 0 '],
      required: [true, 'Bike price is Required '],
    },
    category: {
      type: String,
      enum: {
        values: ['Mountain', 'Road', 'Hybrid', 'Electric'],
        message: '{VALUE} is not a valid category',
      },
    },
    riderType: {
      type: String,
      enum: ["Men", "Women", "Kids"],
      required: [true, "Rider type is required"],
    },

    model: {
      type: String,
      trim: true,
      required: [true, 'Bike model is Required'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Bike Description is Required'],
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity can not be less than 0 '],
      required: [true, 'Quantity of the bike is required'],
    },
    inStock: {
      type: Boolean,

      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
      },
    },
  },
);

const Bike = model<IBike>('Bike', bikeSchema);
export default Bike;
