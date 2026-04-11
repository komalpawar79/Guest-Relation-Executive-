import { asyncHandler, ErrorHandler } from '../utils/errorHandler.js';
import * as clientService from '../services/clientService.js';

export const addClient = asyncHandler(async (req, res, next) => {
  const { clientName, phoneNumber, visitDate, closingManager, source, sourcingManager, remark } = req.body;

  // Required fields validation
  if (!clientName || !visitDate || !closingManager || !source) {
    return next(new ErrorHandler('Please provide all required fields', 400));
  }

  // Phone number is optional, but if provided, must be 10 digits
  if (phoneNumber && !/^[0-9]{10}$/.test(phoneNumber)) {
    return next(new ErrorHandler('Please provide a valid 10-digit phone number', 400));
  }

  // Sourcing manager is always optional

  const client = await clientService.createClient({
    clientName,
    phoneNumber,
    visitDate,
    closingManager,
    source,
    sourcingManager: sourcingManager || '',
    remark: remark || '',
  });

  // Emit socket event for real-time update
  req.io.emit('clientAdded', client);

  res.status(201).json({
    success: true,
    message: 'Client added successfully',
    data: client,
  });
});

export const getClients = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, visitDate, source, closingManager, sourcingManager, gre, attended, page, limit } = req.query;

  const filters = {
    closingManager,
    sourcingManager,
    gre,
    source,
    attended: attended === 'true' ? true : attended === 'false' ? false : undefined,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 50,
  };

  // Handle date filtering
  if (visitDate) {
    // If visitDate is provided, filter for that specific date
    // Parse date as YYYY-MM-DD format (local date, not UTC)
    const [year, month, day] = visitDate.split('-');
    const selectedDate = new Date(year, month - 1, day, 0, 0, 0, 0); // Local date
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999); // End of same day
    
    filters.startDate = selectedDate.toISOString();
    filters.endDate = endOfDay.toISOString();
  } else {
    // Use startDate and endDate if provided
    if (startDate) {
      filters.startDate = startDate;
    }
    if (endDate) {
      filters.endDate = endDate;
    }
  }

  const result = await clientService.getClients(filters);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getClient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const client = await clientService.getClientById(id);

  res.status(200).json({
    success: true,
    data: client,
  });
});

export const updateClient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { clientName, phoneNumber, visitDate, closingManager, source, sourcingManager, remark } = req.body;

  // Validation
  if (!clientName || !visitDate || !closingManager || !source) {
    return next(new ErrorHandler('Please provide all required fields', 400));
  }

  // Phone number is optional, but if provided, must be 10 digits
  if (phoneNumber && !/^[0-9]{10}$/.test(phoneNumber)) {
    return next(new ErrorHandler('Please provide a valid 10-digit phone number', 400));
  }

  // Sourcing manager is always optional

  const client = await clientService.updateClient(id, {
    clientName,
    phoneNumber,
    visitDate,
    closingManager,
    source,
    sourcingManager: sourcingManager || '',
    remark: remark || '',
  });

  // Emit socket event for real-time update
  req.io.emit('clientUpdated', client);

  res.status(200).json({
    success: true,
    message: 'Client updated successfully',
    data: client,
  });
});

export const updateRemark = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { remark } = req.body;

  if (!remark) {
    return next(new ErrorHandler('Please provide a remark', 400));
  }

  const client = await clientService.updateClient(id, { remark });

  // Emit socket event for real-time update
  req.io.emit('remarkUpdated', client);

  res.status(200).json({
    success: true,
    message: 'Remark updated successfully',
    data: client,
  });
});

export const markAttended = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { attended, attendedBy } = req.body;

  const client = await clientService.updateClient(id, { attended, attendedBy });

  // Emit socket event for real-time update
  req.io.emit('attendanceUpdated', client);

  res.status(200).json({
    success: true,
    message: 'Client attendance updated successfully',
    data: client,
  });
});

export const deleteClient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const client = await clientService.deleteClient(id);

  // Emit socket event for real-time update
  req.io.emit('clientDeleted', client._id);

  res.status(200).json({
    success: true,
    message: 'Client deleted successfully',
    data: client,
  });
});
