import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  total: number;
  date: Date;
}

const CartSchema = new Schema<ICart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest carts
  },
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: true,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<ICart>('Cart', CartSchema); 