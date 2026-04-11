import ManagerAttendance from '../models/ManagerAttendance.js';

export const addAttendance = async (attendanceData) => {
  try {
    const attendance = new ManagerAttendance(attendanceData);
    await attendance.save();
    return attendance;
  } catch (error) {
    throw error;
  }
};

export const getAttendance = async (filters = {}) => {
  try {
    const query = ManagerAttendance.find();

    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      query.where('date').gte(startDate).lte(endDate);
    }

    if (filters.managerName) {
      query.where('managerName').equals(filters.managerName);
    }

    if (filters.managerType) {
      query.where('managerType').equals(filters.managerType);
    }

    if (filters.status) {
      query.where('status').equals(filters.status);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const total = await ManagerAttendance.countDocuments(query.getFilter());
    const records = await query.skip(skip).limit(limit).sort({ date: -1 });

    return {
      records,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};

export const getAttendanceById = async (id) => {
  try {
    const record = await ManagerAttendance.findById(id);
    if (!record) {
      throw new Error('Attendance record not found');
    }
    return record;
  } catch (error) {
    throw error;
  }
};

export const updateAttendance = async (id, updateData) => {
  try {
    const record = await ManagerAttendance.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!record) {
      throw new Error('Attendance record not found');
    }
    return record;
  } catch (error) {
    throw error;
  }
};

export const deleteAttendance = async (id) => {
  try {
    const record = await ManagerAttendance.findByIdAndDelete(id);
    if (!record) {
      throw new Error('Attendance record not found');
    }
    return record;
  } catch (error) {
    throw error;
  }
};

export const getManagerStats = async (filters = {}) => {
  try {
    const matchStage = {};

    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      matchStage.date = { $gte: startDate, $lte: endDate };
    }

    if (filters.date) {
      const selectedDate = new Date(filters.date);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      matchStage.date = { $gte: selectedDate, $lt: nextDate };
    }

    if (filters.managerName) {
      matchStage.managerName = filters.managerName;
    }

    if (filters.managerType) {
      matchStage.managerType = filters.managerType;
    }

    const stats = await ManagerAttendance.aggregate([
      { $match: Object.keys(matchStage).length > 0 ? matchStage : {} },
      {
        $group: {
          _id: '$managerName',
          managerName: { $first: '$managerName' },
          managerType: { $first: '$managerType' },
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          absentDays: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
          lateDays: { $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] } },
          leftEarlyDays: { $sum: { $cond: [{ $eq: ['$status', 'Left Early'] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          managerName: 1,
          managerType: 1,
          totalDays: 1,
          presentDays: 1,
          absentDays: 1,
          lateDays: 1,
          leftEarlyDays: 1,
        },
      },
      { $sort: { totalDays: -1 } },
    ]);

    return stats;
  } catch (error) {
    throw error;
  }
};
