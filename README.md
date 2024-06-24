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
  "name": "deviceName"
}
```
**Response:**
```json
{
    "message": "Device created successfully",
    "result": {
        "id": "667956de6171de1784845086"
    }
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

**Response:**
```json
{
    "message": "Devices fetched successfully",
    "result": {
        "currentPage": 1,
        "totalPageCount": 1,
        "totalDataCount": 3,
        "data": [
            {
                "name": "deviceName1",
                "createdAt": "2024-06-24T10:18:13.886Z",
                "id": "667947e590ee6e08febed03b"
            },
            {
                "name": "deviceName2",
                "createdAt": "2024-06-24T10:18:18.270Z",
                "id": "667947ea90ee6e08febed03d"
            },
            {
                "name": "deviceName3",
                "createdAt": "2024-06-24T11:22:06.101Z",
                "id": "667956de6171de1784845086"
            }
        ]
    }
}
```

## POST /locations

Creates a new location.

**Request Body:**

```json
{
  "deviceId": "deviceID",
  "latitude": 23.456,
  "longitude": 128.901
}
```
**Response:**
```json
{
    "message": "Location created successfully",
    "result": {
        "id": "667956de6171de1784855086"
    }
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

**Request Body:**

```json
http://localhost:3000/locations?populateFields=device
```
*Response:*
```json
{
    "message": "Locations fetched successfully",
    "result": {
        "currentPage": 1,
        "totalPageCount": 1,
        "totalDataCount": 2,
        "data": [
            {
                "device": {
                    "name": "deviceName2",
                    "id": "667947e590ee6e08febed03b"
                },
                "latitude": 20.221,
                "longitude": 12.223113312,
                "createdAt": "2024-06-24T10:18:27.693Z",
                "id": "667947f390ee6e08febed044"
            },
            {
                "device": {
                    "name": "deviceName1",
                    "id": "667947ea90ee6e08febed03d"
                },
                "latitude": 40.221,
                "longitude": 42.223113312,
                "createdAt": "2024-06-24T10:23:31.576Z",
                "id": "6679492344b3cc23e5887231"
            }
        ]
    }
}
```

## GET /devices/:device/locations/latest

Retrieves the latest location for a specific device.

Path Parameters

    device: The ID or name of the device whose latest location is being retrieved.

Query Parameters:

    populateFields: Fields to populate in the response (comma-separated)
    selectFields: Fields to get (non predefined data) in the response (comma-separated)

*Request:* 
```json
http://localhost:3000/devices/:device/locations/latest?populateFields=device
```

**Response:**

```json
{
    "message": "Latest location fetched successfully",
    "result": {
        "device": {
            "name": "deviceName2",
            "id": "667947e590ee6e08febed03b"
        },
        "latitude": 20.221,
        "longitude": 12.223113312,
        "createdAt": "2024-06-24T10:18:27.693Z",
        "id": "667947f390ee6e08febed044"
    }
}
```

## GET /devices/:deviceId/locations

Retrieves locations of a specific device with pagination and filtering options.

Parameters:

    page: Page number (default: 1)
    limit: Number of items per page (default: 0)
    sort: Sorting field (default: 'createdAt')
    order: Sorting order ('asc' or 'desc', default: 'asc')
    populateFields: Fields to populate in the response (comma-separated)

*Request:* 
```json
http://localhost:3000/devices/:device/locations?populateFields=device
```
**Response:**

```json
{
    "message": "Locations fetched successfully",
    "result": {
        "currentPage": 1,
        "totalPageCount": 1,
        "totalDataCount": 1,
        "data": [
            {
                "device": {
                    "name": "deviceName1",
                    "id": "667947ea90ee6e08febed03d"
                },
                "latitude": 40.221,
                "longitude": 42.223113312,
                "createdAt": "2024-06-24T10:23:31.576Z",
                "id": "6679492344b3cc23e5887231"
            }
        ]
    }
}
```

## Contributing

If you would like to contribute to the project, please follow these steps:

- Fork the repository.
- Create a new branch for your feature: git checkout -b feature-name
- Commit your changes: git commit -m 'Add some feature'
- Push to the branch: git push origin feature-name
- Submit a pull request.
  
