# Event Management API

## Overview

This is an Event Management API built using **TypeScript**, **Express**, and **Azle** (a framework for building server-side applications). The API provides functionality to manage **venues** and **events**, allowing users to create venues, add events to those venues, update and remove events, and more. Events can be scheduled in a specific venue or left unscheduled for future assignment. The API also handles various CRUD operations on both events and venues.

## Features

- **Venue Management:**
  - Create a new venue.
  - Update venue details.
  - View all venues or a specific venue.
  - Delete a venue (only if no events are scheduled in it).

- **Event Management:**
  - Create a new event and assign it to a venue.
  - Update event details.
  - View all events or a specific event.
  - Remove an event from a venue.
  - Delete an event (only if it is unscheduled).
  - Search for an event in any venue.
  
## Technology Stack

- **Node.js**: Runtime environment for executing JavaScript on the server.
- **Express**: A minimal and flexible Node.js web application framework.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Azle**: A framework for building server-side applications with TypeScript on the Internet Computer.
- **UUID**: For generating unique identifiers for venues and events.

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v14 or later)
- **npm** (v6 or later)

### Setup Instructions

1. Clone the repository:


2. Install the dependencies:

    ```bash
    npm install
    ```

3. Start the server:

    ```bash
    dfx start --clean --background
    dfx deploy
    ```

   The server will start running on `http://localhost:4000`.

## API Endpoints

### Venues

1. **Create a new venue**

   - **Endpoint**: `POST /Venue`
   - **Body**:
     ```json
     {
       "VenueName": "Main Hall"
     }
     ```
   - **Response**: `201 Created`
     ```json
     {
       "status": 201,
       "NewVenue": {
         "VenueId": "uuid",
         "VenueName": "Main Hall",
         "Events": [],
         "createdAt": "2023-09-10T10:00:00Z"
       }
     }
     ```

2. **Get all venues**

   - **Endpoint**: `GET /Venue`
   - **Response**: `200 OK`
     ```json
     {
       "status": 200,
       "AllVenue": [...]
     }
     ```

3. **Get a specific venue**

   - **Endpoint**: `GET /Venue/:id`
   - **Response**: `200 OK`
     ```json
     {
       "status": 200,
       "Venue": {
         "VenueId": "uuid",
         "VenueName": "Main Hall",
         "Events": [...]
       }
     }
     ```

4. **Update a venue**

   - **Endpoint**: `PUT /Venue/:id`
   - **Body**:
     ```json
     {
       "VenueName": "Updated Hall"
     }
     ```
   - **Response**: `200 OK`
     ```json
     {
       "status": 200,
       "message": "Updated successfully"
     }
     ```

5. **Delete a venue**

   - **Endpoint**: `DELETE /Venue/:id`
   - **Response**: `200 OK`
     ```json
     {
       "status": 200,
       "message": "Venue deleted successfully"
     }
     ```

### Events

1. **Create a new event in a venue**

   - **Endpoint**: `POST /Venue/:id/Event`
   - **Body**:
     ```json
     {
       "EventName": "Music Concert",
       "Description": "An evening of classical music.",
       "Organizer": "John Doe",
       "Price": 50
     }
     ```
   - **Response**: `201 Created`
     ```json
     {
       "status": 201,
       "message": "Event created and scheduled successfully"
     }
     ```

2. **Get all events**

   - **Endpoint**: `GET /Event`
   - **Response**: `200 OK`
     ```json
     {
       "status": 200,
       "AllEvent": [...]
     }
     ```

3. **Get a specific event**

   - **Endpoint**: `GET /Event/:id`
   - **Response**: `200 OK`
     ```json
     {
       "status": 200,
       "Event": {
         "EventId": "uuid",
         "EventName": "Music Concert",
         "Description": "An evening of classical music.",
         "Organizer": "John Doe",
         "Price": 50
       }
     }
     ```

4. **Update an event**

   - **Endpoint**: `PUT /Event/:id`
   - **Body**:
     ```json
     {
       "EventName": "Updated Concert"
     }
     ```
   - **Response**: `200 OK`
     ```json
     {
       "status": 200,
       "message": "Updated successfully"
     }
     ```

5. **Delete an event**

   - **Endpoint**: `DELETE /Event/:id`
   - **Response**: `200 OK`
     ```json
     {
       "status": 200,
       "message": "Event deleted successfully"
     }
     ```

6. **Remove an event from a venue**

   - **Endpoint**: `PUT /Venue/removeEvent/:VenueId/Event/:EventId`
   - **Response**: `200 OK`
     ```json
     {
       "status": 200,
       "message": "Event removed from venue successfully"
     }
     ```

7. **Add an existing event to a venue**

   - **Endpoint**: `PUT /Venue/addEvent/:VenueId/Event/:EventId`
   - **Response**: `200 OK`
     ```json
     {
       "status": 200,
       "message": "Event added to venue successfully"
     }
     ```

8. **Search for an event in a venue**

   - **Endpoint**: `POST /Event/search/:id`
   - **Response**: `200 OK`
     ```json
     {
       "status": 200,
       "message": "The event with id={id} is scheduled in venue with id={venueId}"
     }
     ```

## Error Handling

The API returns appropriate error messages with status codes for various error conditions, such as:

- `400 Bad Request`: Invalid request data or conditions (e.g., trying to delete a scheduled event).
- `404 Not Found`: When a requested event or venue does not exist.
- `500 Internal Server Error`: For unexpected errors on the server.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
