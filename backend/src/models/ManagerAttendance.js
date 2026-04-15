import mongoose from 'mongoose';

const managerAttendanceSchema = new mongoose.Schema(
  {
    managerName: {
      type: String,
      required: [true, 'Please provide manager name'],
      trim: true,
      index: true,
    },
    managerType: {
      type: String,
      enum: ['Closing Manager', 'Sourcing Manager', 'GRE', 'CRM'],
      required: [true, 'Please specify manager type'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide attendance date'],
      index: true,
    },
    checkInTime: {
      type: String,
      default: '',
    },
    checkOutTime: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Left Early', 'Week Off', 'Leave'],
      default: 'Present',
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique attendance per manager per day
managerAttendanceSchema.index({ managerName: 1, managerType: 1, date: 1 });

export default mongoose.model('ManagerAttendance', managerAttendanceSchema);
