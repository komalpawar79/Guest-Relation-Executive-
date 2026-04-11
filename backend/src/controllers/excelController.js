import { asyncHandler, ErrorHandler } from '../utils/errorHandler.js';
import Client from '../models/Client.js';
import XLSX from 'xlsx';

export const exportClients = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, closingManager, sourcingManager, attended, reportType } = req.query;

  const matchStage = {};

  // Smart date filtering
  if (startDate) {
    matchStage.visitDate = {};
    matchStage.visitDate.$gte = new Date(startDate);
    
    if (endDate) {
      // If both dates provided: from startDate to endDate
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999); // End of day
      matchStage.visitDate.$lte = endDateObj;
    } else {
      // If only startDate provided: from startDate until today
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999); // End of today
      matchStage.visitDate.$lte = todayEnd;
    }
  } else if (endDate) {
    // If only endDate provided: from beginning until endDate
    matchStage.visitDate = {};
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    matchStage.visitDate.$lte = endDateObj;
  }

  if (closingManager) {
    matchStage.closingManager = closingManager;
  }

  if (sourcingManager) {
    matchStage.sourcingManager = sourcingManager;
  }

  if (typeof attended !== 'undefined') {
    matchStage.attended = attended === 'true';
  }

  const clients = await Client.find(matchStage).sort({ visitDate: -1 }).lean();

  if (clients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No clients found for the given filters',
    });
  }

  // Format data for Excel
  const excelData = clients.map((client) => ({
    'Client Name': client.clientName,
    'Phone Number': client.phoneNumber,
    'Visit Date': new Date(client.visitDate).toLocaleDateString('en-IN'),
    'Source': client.source || '-',
    'Closing Manager': client.closingManager,
    'Sourcing Manager': client.sourcingManager || '-',
    Attended: client.attended ? 'Yes' : 'No',
    'Attended By': client.attendedBy || '-',
    Remark: client.remark || '-',
    'Created Date': new Date(client.createdAt).toLocaleDateString('en-IN'),
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="GRE_Report_${reportType || 'Export'}_${Date.now()}.xlsx"`
  );

  // Write file to response
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  res.send(buffer);
});
