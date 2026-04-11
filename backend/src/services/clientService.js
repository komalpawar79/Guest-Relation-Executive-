import Client from '../models/Client.js';

export const createClient = async (clientData) => {
  try {
    const newClient = new Client(clientData);
    await newClient.save();
    return newClient;
  } catch (error) {
    throw error;
  }
};

export const getClients = async (filters = {}) => {
  try {
    const query = Client.find();

    // Smart date filtering
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      
      if (filters.endDate) {
        // If both dates provided: from startDate to endDate
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        query.where('visitDate').gte(startDate).lte(endDate);
      } else {
        // If only startDate provided: from startDate until today
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999); // End of today
        query.where('visitDate').gte(startDate).lte(todayEnd);
      }
    } else if (filters.endDate) {
      // If only endDate provided: from beginning until endDate
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      query.where('visitDate').lte(endDate);
    }

    if (filters.closingManager) {
      query.where('closingManager').equals(filters.closingManager);
    }

    if (filters.sourcingManager) {
      query.where('sourcingManager').equals(filters.sourcingManager);
    }

    if (filters.source) {
      query.where('source').equals(filters.source);
    }

    if (typeof filters.attended !== 'undefined') {
      query.where('attended').equals(filters.attended);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const total = await Client.countDocuments(query.getFilter());
    const clients = await query.skip(skip).limit(limit).sort({ visitDate: -1 });

    return {
      clients,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
};

export const getClientById = async (id) => {
  try {
    const client = await Client.findById(id);
    if (!client) {
      throw new Error('Client not found');
    }
    return client;
  } catch (error) {
    throw error;
  }
};

export const updateClient = async (id, updateData) => {
  try {
    const client = await Client.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!client) {
      throw new Error('Client not found');
    }
    return client;
  } catch (error) {
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    const client = await Client.findByIdAndDelete(id);
    if (!client) {
      throw new Error('Client not found');
    }
    return client;
  } catch (error) {
    throw error;
  }
};
