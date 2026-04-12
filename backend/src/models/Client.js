import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Please provide a client name'],
      trim: true,
      minlength: [2, 'Client name must be at least 2 characters'],
      maxlength: [100, 'Client name cannot exceed 100 characters'],
    },
    phoneNumber: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
      default: '',
      trim: true,
    },
    visitDate: {
      type: Date,
      required: [true, 'Please provide a visit date'],
      index: true,
    },
    closingManager: {
      type: String,
      required: [true, 'Please provide a closing manager name'],
      trim: true,
      index: true,
    },
    source: {
      type: String,
      required: [true, 'Please provide a client source'],
      enum: ['Walking', 'Reference', 'CRM', 'Channel Partner', 'Revisit'],
      index: true,
    },
    sourcingManager: {
      type: String,
      trim: true,
      index: true,
      default: '',
    },
    remark: {
      type: String,
      trim: true,
      maxlength: [500, 'Remark cannot exceed 500 characters'],
      default: '',
    },
    attended: {
      type: Boolean,
      default: false,
      index: true,
    },
    attendedBy: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for common filter combinations
clientSchema.index({ visitDate: 1, closingManager: 1 });
clientSchema.index({ visitDate: 1, sourcingManager: 1 });
clientSchema.index({ visitDate: 1, attended: 1 });
clientSchema.index({ closingManager: 1, visited: 1 });

// Virtual for day of visit
clientSchema.virtual('visitDay').get(function () {
  return this.visitDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

const Client = mongoose.model('Client', clientSchema);
export default Client;
