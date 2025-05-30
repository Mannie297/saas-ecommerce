import mongoose, { Schema, Document } from 'mongoose';

export interface IContactUs extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  date: Date;
}

const ContactUsSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model<IContactUs>('ContactUs', ContactUsSchema); 