# GPS Tracker

GPS Tracker is a Nodejs backend application designed to track the location of devices in real-time. It provides RESTful APIs for creating and managing devices and their locations. With GPS Tracker, you can easily monitor the movements of your devices and retrieve location data efficiently.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Contributing](#contributing)

## Installation

1. Clone the repository: `git clone https://github.com/derin98/GPS-Tracker.git`
2. Navigate to the project directory: `cd GPS-Tracker`
3. Install dependencies: `npm install`

## Usage

1. Start the server: `npm run dev`
2. Access the API endpoints using a tool like Postman or curl.

## Endpoints

### POST /devices

Creates a new device.

**Request Body:**
```json
{
  "name": "Device Name"
}
```

## GET /devices

Retrieves devices with pagination and filtering options.

Parameters:

    page: Page number (default: 1)
    limit: Number of items per page (default: will list all)
    sort: Sorting field (default: 'createdAt')
    order: Sorting order ('asc' or 'desc', default: 'asc')
    populateFields: Fields to populate in the response (comma-separated)
    selectFields: Fields to get (non predefined data) in the response (comma-separated)

## POST /locations

Creates a new location.

**Request Body:**

```json
{
  "deviceId": "Device ID",
  "latitude": 123.456,
  "longitude": 78.901
}
```

## GET /locations

Retrieves locations with pagination and filtering options.

Parameters:

    page: Page number (default: 1)
    limit: Number of items per page (default: 0)
    sort: Sorting field (default: 'createdAt')
    order: Sorting order ('asc' or 'desc', default: 'asc')
    populateFields: Fields to populate in the response (comma-separated)
    selectFields: Fields to get (non predefined data) in the response (comma-separated)

## GET /devices/:deviceId/locations/latest

Retrieves the latest location for a specific device.

Parameters:

    populateFields: Fields to populate in the response (comma-separated)
    selectFields: Fields to get (non predefined data) in the response (comma-separated)

## GET /devices/:deviceId/locations

Retrieves locations of a specific device with pagination and filtering options.

Parameters:

    page: Page number (default: 1)
    limit: Number of items per page (default: 0)
    sort: Sorting field (default: 'createdAt')
    order: Sorting order ('asc' or 'desc', default: 'asc')
    populateFields: Fields to populate in the response (comma-separated)

## Contributing

If you would like to contribute to the project, please follow these steps:

- Fork the repository.
- Create a new branch for your feature: git checkout -b feature-name
- Commit your changes: git commit -m 'Add some feature'
- Push to the branch: git push origin feature-name
- Submit a pull request.
  
