import { asyncHandler, ErrorHandler } from '../utils/errorHandler.js';
import * as attendanceService from '../services/attendanceService.js';

export const addAttendance = asyncHandler(async (req, res, next) => {
  const { managerName, managerType, date, checkInTime, checkOutTime, status, remarks } = req.body;

  // Validation
  if (!managerName || !managerType || !date) {
    return next(new ErrorHandler('Please provide all required fields', 400));
  }

  // Check-in time is required only if status is not Absent, Week Off, or Leave
  if (status !== 'Absent' && status !== 'Week Off' && status !== 'Leave' && !checkInTime) {
    return next(new ErrorHandler('Check-in time is required', 400));
  }

  if (!['Closing Manager', 'Sourcing Manager', 'GRE', 'CRM'].includes(managerType)) {
    return next(new ErrorHandler('Invalid manager type', 400));
  }

  const attendance = await attendanceService.addAttendance({
    managerName,
    managerType,
    date: new Date(date),
    checkInTime,
    checkOutTime: checkOutTime || '',
    status: status || 'Present',
    remarks: remarks || '',
  });

  // Emit socket event for real-time update
  req.io.emit('attendanceAdded', attendance);

  res.status(201).json({
    success: true,
    message: 'Attendance marked successfully',
    data: attendance,
  });
});

export const getAttendance = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, managerName, managerType, status, page, limit } = req.query;

  // Handle date range: if startDate provided, use it as full day (00:00 to 23:59:59)
  let finalStartDate = startDate;
  let finalEndDate = endDate;
  
  if (startDate && !endDate) {
    // Single date provided - filter for entire day
    finalStartDate = startDate;
    finalEndDate = startDate;
  }

  const filters = {
    startDate: finalStartDate,
    endDate: finalEndDate,
    managerName,
    managerType,
    status,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 50,
  };

  const result = await attendanceService.getAttendance(filters);

  res.status(200).json({
    success: true,
    data: result.records || [],
    pagination: {
      total: result.total,
      pages: result.pages,
      currentPage: result.currentPage,
    },
  });
});

export const getAttendanceById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const record = await attendanceService.getAttendanceById(id);

  res.status(200).json({
    success: true,
    data: record,
  });
});

export const updateAttendance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { checkInTime, checkOutTime, status, remarks } = req.body;

  // Check-in time is required only if status is not Absent or Week Off
  if (status && status !== 'Absent' && status !== 'Week Off' && !checkInTime) {
    return next(new ErrorHandler('Check-in time is required', 400));
  }

  const record = await attendanceService.updateAttendance(id, {
    checkInTime,
    checkOutTime: checkOutTime || '',
    status,
    remarks,
  });

  // Emit socket event for real-time update
  req.io.emit('attendanceUpdated', record);

  res.status(200).json({
    success: true,
    message: 'Attendance updated successfully',
    data: record,
  });
});

export const deleteAttendance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const record = await attendanceService.deleteAttendance(id);

  // Emit socket event for real-time update
  req.io.emit('attendanceDeleted', record._id);

  res.status(200).json({
    success: true,
    message: 'Attendance deleted successfully',
    data: record,
  });
});

export const getManagerStats = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, managerName, managerType, date } = req.query;

  const filters = {
    startDate,
    endDate,
    managerName,
    managerType,
    date,
  };

  const stats = await attendanceService.getManagerStats(filters);

  res.status(200).json({
    success: true,
    data: Array.isArray(stats) ? stats : [],
  });
});
