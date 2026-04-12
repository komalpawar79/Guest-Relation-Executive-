import { asyncHandler, ErrorHandler } from '../utils/errorHandler.js';
import Client from '../models/Client.js';

export const getDailyReport = asyncHandler(async (req, res, next) => {
  const { date } = req.query;

  if (!date) {
    return next(new ErrorHandler('Please provide a date', 400));
  }

  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const report = await Client.aggregate([
    {
      $match: {
        visitDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalClients: { $sum: 1 },
        attended: {
          $sum: { $cond: ['$attended', 1, 0] },
        },
        notAttended: {
          $sum: { $cond: ['$attended', 0, 1] },
        },
      },
    },
  ]);

  const detailedReport = await Client.find(
    {
      visitDate: {
        $gte: startDate,
        $lte: endDate,
      },
    },
    null,
    { sort: { visitDate: -1 } }
  );

  res.status(200).json({
    success: true,
    data: {
      date,
      summary: report[0] || { totalClients: 0, attended: 0, notAttended: 0 },
      details: detailedReport,
    },
  });
});

export const getMonthlyReport = asyncHandler(async (req, res, next) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return next(new ErrorHandler('Please provide month and year', 400));
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const report = await Client.aggregate([
    {
      $match: {
        visitDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$visitDate',
          },
        },
        totalClients: { $sum: 1 },
        attended: {
          $sum: { $cond: ['$attended', 1, 0] },
        },
        notAttended: {
          $sum: { $cond: ['$attended', 0, 1] },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const summary = await Client.aggregate([
    {
      $match: {
        visitDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalClients: { $sum: 1 },
        attended: {
          $sum: { $cond: ['$attended', 1, 0] },
        },
        notAttended: {
          $sum: { $cond: ['$attended', 0, 1] },
        },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      month,
      year,
      summary: summary[0] || { totalClients: 0, attended: 0, notAttended: 0 },
      dailyBreakdown: report,
    },
  });
});

export const getYearlyReport = asyncHandler(async (req, res, next) => {
  const { year } = req.query;

  if (!year) {
    return next(new ErrorHandler('Please provide a year', 400));
  }

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

  const report = await Client.aggregate([
    {
      $match: {
        visitDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m',
            date: '$visitDate',
          },
        },
        totalClients: { $sum: 1 },
        attended: {
          $sum: { $cond: ['$attended', 1, 0] },
        },
        notAttended: {
          $sum: { $cond: ['$attended', 0, 1] },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const summary = await Client.aggregate([
    {
      $match: {
        visitDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalClients: { $sum: 1 },
        attended: {
          $sum: { $cond: ['$attended', 1, 0] },
        },
        notAttended: {
          $sum: { $cond: ['$attended', 0, 1] },
        },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      year,
      summary: summary[0] || { totalClients: 0, attended: 0, notAttended: 0 },
      monthlyBreakdown: report,
    },
  });
});

export const getManagerAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, closingManager, sourcingManager, gre, attended } = req.query;

  const matchStage = {};

  // Smart date filtering with proper local date parsing
  if (startDate) {
    matchStage.visitDate = {};
    const [startYear, startMonth, startDay] = startDate.split('-');
    const startDateObj = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay), 0, 0, 0, 0);
    matchStage.visitDate.$gte = startDateObj;
    
    if (endDate) {
      // If both dates provided: from startDate to endDate
      const [endYear, endMonth, endDay] = endDate.split('-');
      const endDateObj = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay), 23, 59, 59, 999);
      matchStage.visitDate.$lte = endDateObj;
    } else {
      // If only startDate provided: from startDate until today
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      matchStage.visitDate.$lte = todayEnd;
    }
  } else if (endDate) {
    // If only endDate provided: from beginning until endDate
    matchStage.visitDate = {};
    const [endYear, endMonth, endDay] = endDate.split('-');
    const endDateObj = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay), 23, 59, 59, 999);
    matchStage.visitDate.$lte = endDateObj;
  }

  // Add filter for closingManager
  if (closingManager) {
    matchStage.closingManager = closingManager;
  }

  // Add filter for sourcingManager
  if (sourcingManager) {
    matchStage.sourcingManager = sourcingManager;
  }

  // Add filter for GRE staff
  if (gre) {
    matchStage.$or = [
      { remark: { $regex: gre, $options: 'i' } },
      { 'attendanceNotes': { $regex: gre, $options: 'i' } }
    ];
  }

  // Add filter for attendance status
  if (attended) {
    matchStage.attended = attended === 'true';
  }

  const closingManagerStats = await Client.aggregate([
    { $match: Object.keys(matchStage).length > 0 ? matchStage : {} },
    {
      $group: {
        _id: '$closingManager',
        totalClients: { $sum: 1 },
        attended: {
          $sum: { $cond: ['$attended', 1, 0] },
        },
        notAttended: {
          $sum: { $cond: ['$attended', 0, 1] },
        },
        attendanceRate: {
          $avg: { $cond: ['$attended', 1, 0] },
        },
      },
    },
    {
      $sort: { totalClients: -1 },
    },
  ]);

  const sourcingManagerStats = await Client.aggregate([
    { $match: Object.keys(matchStage).length > 0 ? matchStage : {} },
    {
      $group: {
        _id: '$sourcingManager',
        totalClients: { $sum: 1 },
        attended: {
          $sum: { $cond: ['$attended', 1, 0] },
        },
        notAttended: {
          $sum: { $cond: ['$attended', 0, 1] },
        },
        attendanceRate: {
          $avg: { $cond: ['$attended', 1, 0] },
        },
      },
    },
    {
      $sort: { totalClients: -1 },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      closingManager: closingManagerStats,
      sourcingManager: sourcingManagerStats,
    },
  });
});

export const getAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, closingManager, sourcingManager, gre, attended } = req.query;

  const matchStage = {};

  // Smart date filtering with proper local date parsing
  if (startDate) {
    matchStage.visitDate = {};
    
    // Parse startDate as local date (YYYY-MM-DD format)
    const [startYear, startMonth, startDay] = startDate.split('-');
    const startDateObj = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay), 0, 0, 0, 0);
    matchStage.visitDate.$gte = startDateObj;
    
    if (endDate) {
      // If both dates provided: from startDate to endDate (end of day)
      const [endYear, endMonth, endDay] = endDate.split('-');
      const endDateObj = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay), 23, 59, 59, 999);
      matchStage.visitDate.$lte = endDateObj;
    } else {
      // If only startDate provided: should not happen now (frontend sets both), but handle it
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      matchStage.visitDate.$lte = todayEnd;
    }
  } else if (endDate) {
    // If only endDate provided: from beginning until endDate
    matchStage.visitDate = {};
    const [endYear, endMonth, endDay] = endDate.split('-');
    const endDateObj = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay), 23, 59, 59, 999);
    matchStage.visitDate.$lte = endDateObj;
  }

  // Add filter for closingManager
  if (closingManager) {
    matchStage.closingManager = closingManager;
  }

  // Add filter for sourcingManager
  if (sourcingManager) {
    matchStage.sourcingManager = sourcingManager;
  }

  // Add filter for GRE staff (stored in field, needs to match)
  if (gre) {
    matchStage.$or = [
      { remark: { $regex: gre, $options: 'i' } },
      { 'attendanceNotes': { $regex: gre, $options: 'i' } }
    ];
  }

  // Add filter for attendance status
  if (attended) {
    matchStage.attended = attended === 'true';
  }

  const analytics = await Client.aggregate([
    { $match: Object.keys(matchStage).length > 0 ? matchStage : {} },
    {
      $facet: {
        totalCount: [
          {
            $count: 'total',
          },
        ],
        attendanceCount: [
          {
            $group: {
              _id: '$attended',
              count: { $sum: 1 },
            },
          },
        ],
        clientsPerDay: [
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$visitDate',
                },
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ],
        managerDistribution: [
          {
            $group: {
              _id: '$closingManager',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: analytics[0],
  });
});
