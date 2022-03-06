# Emmanuel Count

AKA manual count

This application is a part of the 12urenloop project

We use this application in case Telraam goes down this application will be used as fallback.

The backend should work without being connected to Telraam and the frontend should be able to be temporary offline.

## Setup

### Environment variables

The backend has a .env file that contains the following environment variables:
The defaults for each variable can be found under `src/config.ts`

| Variable         | Description                                            |
|------------------|--------------------------------------------------------|
| MODE             | Is used to define log type (production or development) |
| TELRAAM_ENDPOINT | The endpoint of the Telraam API                        |
| PORT             | Port where the backend is served at                    |
| LAP_MIN_INTERVAL | Min lap difference in milliseconds between 2 laps      |

### Installation

Install the dependencies:

`yarn install` or `npm install`

To serve both the front and backend you can use the following commands:

`yarn dev` or ` npm run dev`
