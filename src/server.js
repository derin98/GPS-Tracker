// server.js

// Required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Express app initialization
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/gps_tracking', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// MongoDB Models
const Device = mongoose.model('Device', {
    name: String,
    createdAt: { type: Date, default: Date.now }
});

const Location = mongoose.model('Location', {
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device' // Referencing the 'Device' model
    },
    latitude: Number,
    longitude: Number,
    createdAt: { type: Date, default: Date.now }
});

// Middleware
app.use(bodyParser.json());




// POST endpoint to create a new device
app.post('/devices', async (req, res) => {
    try {
        const { name } = req.body;
        const device = new Device({ name });
        await device.save();
        successResponse(res, "Device created successfully", { id: device._id }, 201);
    } catch (error) {
        console.error(error);
        errorResponse(res, "Server Error", 500, null);
    }
});

// GET endpoint to retrieve devices with pagination and filtering options
app.get('/devices', async (req, res) => {
    try {
        // Initialize query, populateFields, and selectFields
        let query = {};
        let populateFields = req.query.populateFields;
        let selectFields = req.query.selectFields;

        // Filtering and pagination options
        populateFields = populateFields ? [...new Set(populateFields.split(','))].filter(field => field !== 'userPassword').join(' ') : "";
        selectFields = selectFields ? [...new Set(selectFields.split(',')), 'name', '_id'].filter(field => field !== 'userPassword').join(' ') : ['name', '_id'];

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const skip = (page - 1) * limit;

        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'desc' ? -1 : 1;

        // Count total devices
        const countDevices = await Device.countDocuments(query);

        // Handle pagination
        if (limit === 0 && page > 1) {
            return paginationResObj(page, 1, countDevices, []);
        }

        // Retrieve devices from database
        const devices = await getAllDevicesDbOperation(query, sort, order, page, limit, skip, selectFields, populateFields);

        const totalPages = countDevices === 0 ? 0 : (limit === 0 ? 1 : Math.ceil(countDevices / limit));
        const paginatedDevices = paginationResObj(page, totalPages, countDevices, devices);
        const message = "Devices fetched successfully";

        return successResponse(res, message, paginatedDevices, 200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// POST endpoint to create a new location
app.post('/locations', async (req, res) => {
    try {
        const { deviceId, latitude, longitude } = req.body;

        // Validate input data
        if (!mongoose.Types.ObjectId.isValid(deviceId)) {
            return res.status(400).json({ message: "deviceId is not a valid ObjectId" });
        }
        if (!deviceId || !latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ message: "Invalid latitude or longitude value" });
        }

        // Check if the device exists
        const deviceExists = await Device.exists({ _id: deviceId });
        if (!deviceExists) {
            return res.status(404).json({ message: "Device not found" });
        }

        // Create location
        const location = new Location({ deviceId, latitude, longitude });
        await location.save();
        successResponse(res, "Location created successfully", { id: location._id }, 201);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// GET endpoint to retrieve locations with pagination and filtering options
app.get('/locations', async (req, res) => {
    try {
        // Initialize query, populateFields, and selectFields
        let query = {};
        let populateFields = req.query.populateFields;
        let selectFields = req.query.selectFields;

        // Filtering and pagination options
        populateFields = populateFields ? [...new Set(populateFields.split(','))].filter(field => field !== 'userPassword').join(' ') : "";
        selectFields = selectFields ? [...new Set(selectFields.split(',')), 'name', '_id'].filter(field => field !== 'userPassword').join(' ') : ['name', '_id', 'deviceId', 'latitude', 'longitude'];

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const skip = (page - 1) * limit;

        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'desc' ? -1 : 1;

        // Count total locations
        const countLocations = await Location.countDocuments(query);

        // Handle pagination
        if (limit === 0 && page > 1) {
            return paginationResObj(page, 1, countLocations, []);
        }


        // Retrieve locations from database
        const locations = await getAllLocationsDbOperation(query, sort, order, page, limit, skip, selectFields, populateFields);

        const totalPages = countLocations === 0 ? 0 : (limit === 0 ? 1 : Math.ceil(countLocations / limit));
        const paginatedLocations = paginationResObj(page, totalPages, countLocations, locations);
        const message = "Locations fetched successfully";

        return successResponse(res, message, paginatedLocations, 200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// GET endpoint to retrieve latest location for a device
app.get('/devices/:deviceId/locations/latest', async (req, res) => {
    try {
        const { deviceId } = req.params;

        // Validate deviceId
        if (!mongoose.Types.ObjectId.isValid(deviceId)) {
            return res.status(400).json({ message: "deviceId is not a valid ObjectId" });
        }

        // Query and filtering options
        let query = { deviceId };
        let populateFields = req.query.populateFields;
        let selectFields = req.query.selectFields;

        // Filtering options
        populateFields = populateFields ? [...new Set(populateFields.split(','))].filter(field => field !== 'userPassword').join(' ') : "";
        selectFields = selectFields ? [...new Set(selectFields.split(',')), 'name', '_id'].filter(field => field !== 'userPassword').join(' ') : ['name', '_id', 'deviceId', 'latitude', 'longitude'];

        // Retrieve latest location from database
        const location = await getLatestLocationDbOperation(query, selectFields, populateFields);

        if (!location) {
            return errorResponse(res, "Location not found", 404, null);
        }

        const message = "Location fetched successfully";
        return successResponse(res, message, location, 200);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// GET endpoint to retrieve locations of a device with pagination and filtering options
app.get('/devices/:deviceId/locations', async (req, res) => {
    try {
        const { deviceId } = req.params;

        // Validate deviceId
        if (!mongoose.Types.ObjectId.isValid(deviceId)) {
            return res.status(400).json({ message: "deviceId is not a valid ObjectId" });
        }

        // Query and filtering options
        let query = { deviceId };
        let populateFields = req.query.populateFields;
        let selectFields = req.query.selectFields;

        // Filtering and pagination options
        populateFields = populateFields ? [...new Set(populateFields.split(','))].filter(field => field !== 'userPassword').join(' ') : "";
        selectFields = selectFields ? [...new Set(selectFields.split(',')), 'name', '_id'].filter(field => field !== 'userPassword').join(' ') : ['name', '_id', 'deviceId', 'latitude', 'longitude'];

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const skip = (page - 1) * limit;

        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'desc' ? -1 : 1;

        // Count total locations for the device
        const countLocations = await Location.countDocuments(query);

        // Handle pagination
        if (limit === 0 && page > 1) {
            return paginationResObj(page, 1, countLocations, []);
        }

        // Retrieve locations of the device from database
        const locations = await getAllLocationsDbOperation(query, sort, order, page, limit, skip, selectFields, populateFields);

        const totalPages = countLocations === 0 ? 0 : (limit === 0 ? 1 : Math.ceil(countLocations / limit));
        const paginatedLocations = paginationResObj(page, totalPages, countLocations, locations);
        const message = "Locations fetched successfully";

        return successResponse(res, message, paginatedLocations, 200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});






// Function to retrieve devices from database
async function getAllDevicesDbOperation(query, sort, order, page, limit, skip, selectFields, populateFields) {
    try {
        let queryObject;
        if (limit > 0) {
            queryObject = Device.find(query).sort({ [sort]: order }).skip(skip).limit(limit);
        } else {
            queryObject = Device.find(query).sort({ [sort]: order });
        }

        // Select fields
        if (selectFields) {
            queryObject = queryObject.select(selectFields);
        }

        // Populate fields
        if (populateFields) {
            const populateFieldsArray = populateFields.split(' ');
            const validPopulateFields = populateFieldsArray.filter(field => Device.schema.path(field) != null);
            queryObject = queryObject.populate({
                path: validPopulateFields.join(' '),
                select: '_id name email employeeId buUserId password expiredAt shortName usersCount',
                options: {
                    lean: true,
                    transform: doc => {
                        const { _id, ...rest } = doc;
                        return { ...rest, id: _id };
                    },
                },
            });
        }

        const results = await queryObject.lean();
        return results.map(result => {
            const { _id, ...rest } = result;
            return { ...rest, id: _id };
        });
    } catch (error) {
        console.error('Error in getAllDevices:', error);
        return null;
    }
}


// Function to retrieve locations from database
async function getAllLocationsDbOperation(query, sort, order, page, limit, skip, selectFields, populateFields) {
    try {
        let queryObject;
        if (limit > 0) {
            queryObject = Location.find(query).sort({ [sort]: order }).skip(skip).limit(limit);
        } else {
            queryObject = Location.find(query).sort({ [sort]: order });
        }

        // Select fields
        if (selectFields) {
            queryObject = queryObject.select(selectFields);
        }

        // Populate fields
        if (populateFields) {
            const populateFieldsArray = populateFields.split(' ');
            const validPopulateFields = populateFieldsArray.filter(field => Location.schema.path(field) != null);
            queryObject = queryObject.populate({
                path: validPopulateFields.join(' '),
                select: '_id name email employeeId buUserId password expiredAt shortName usersCount',
                options: {
                    lean: true,
                    transform: doc => {
                        const { _id, ...rest } = doc;
                        return { ...rest, id: _id };
                    },
                },
            });
        }

        const results = await queryObject.lean();
        return results.map(result => {
            const { _id, ...rest } = result;
            return { ...rest, id: _id };
        });
    } catch (error) {
        console.error('Error in getAllLocations:', error);
        return null;
    }
}



// Function to retrieve latest location from database
async function getLatestLocationDbOperation(query, selectFields, populateFields) {
    try {
        let queryObject = Location.findOne(query);

        // Select fields
        if (selectFields) {
            queryObject = queryObject.select(selectFields);
        }

        // Populate fields
        if (populateFields) {
            const populateFieldsArray = populateFields.split(' ');
            const validPopulateFields = populateFieldsArray.filter(field => Location.schema.path(field) != null);
            queryObject = queryObject.populate({
                path: validPopulateFields.join(' '),
                select: '_id name email employeeId buUserId password expiredAt shortName usersCount',
                options: {
                    lean: true,
                    transform: doc => {
                        const { _id, ...rest } = doc;
                        return { ...rest, id: _id }; // Transform _id to id
                    },
                },
            });
        }

        const result = await queryObject.lean();

        const { _id, ...rest } = result;
        return { ...rest, id: _id };

    } catch (error) {
        console.error('Error in getLatestLocation:', error);
        return null;
    }
}






const successResponse = function (res, message, result, status) {

    status = status || 200;
    return res.status(status).json({
        status,
        message,
        result
    });
};

const errorResponse = function (res, message, status, errorInfo) {
    status = status || 500;
    return res.status(status).json({
        status,
        message,
        errorInfo
    });
};

const paginationResObj = function (page, totalPages, totalDataCount, data) {
    // Check if page, totalPages, and totalDataCount are numbers
    if (typeof page !== 'number' || typeof totalPages !== 'number' || typeof totalDataCount !== 'number') {
        throw new Error('Invalid pagination parameters. Please provide valid numbers for page, totalPages, and totalDataCount.');
    }

    // Check if data is an array
    if (!Array.isArray(data)) {
        throw new Error('Invalid data parameter. Please provide an array for data.');
    }

    // Return the result object with default values if necessary
    return {
        currentPage: page,
        totalPageCount: totalPages,
        totalDataCount: totalDataCount,
        data: data ? data : []
    };
}
