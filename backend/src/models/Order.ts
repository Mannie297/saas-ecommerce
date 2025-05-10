import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  paymentDetails: {
    stripePaymentId: string;
    tipAmount: number;
    shippingCost: number;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: true
  },
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentDetails: {
    type: {
      stripePaymentId: {
        type: String,
        required: true
      },
      tipAmount: {
        type: Number,
        required: true,
        default: 0
      },
      shippingCost: {
        type: Number,
        required: true,
        default: 0
      }
    },
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IOrder>('Order', OrderSchema); 