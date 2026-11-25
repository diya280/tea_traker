import mongoose from 'mongoose';

const teaSchema = new mongoose.Schema({
  personName: { type: String, required: true, trim: true, maxlength: 80 },
  date: { type: Date, required: true },
  count: { type: Number, required: true, min: 0, max: 500, validate: Number.isInteger },
  remarks: { type: String, trim: true, maxlength: 250, default: '' }
}, { timestamps: true });

teaSchema.index({ date: 1, personName: 1 });
export default mongoose.model('TeaEntry', teaSchema);
