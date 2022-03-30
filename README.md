# Emmanuel Count

AKA manual count

This application is a part of the 12urenloop project

We use this application in case Telraam goes down this application will be used as fallback.

The backend should work without being connected to Telraam and the frontend should be able to be temporary offline.

## Setup

### Environment variables

The app uses 1 .env file. The template is located in the root of the project.
Following variables can be found in the .env file:

| Variable            | Description                                                        |
| ------------------- | ------------------------------------------------------------------ |
| MODE                | Is used to define log type (production or development)             |
| TELRAAM_ENDPOINT    | The endpoint of the Telraam API                                    |
| PORT                | Port where the backend is served at                                |
| LAP_MIN_INTERVAL    | Min lap difference in milliseconds between 2 laps                  |
| TEAM_FETCH_INTERVAL | Time between fetches for laps in telraam, in ms.                   |
| LAP_FETCH_INTERVAL  | Time between a request for all not registered laps to the frontend |
| VITE_SERVER_IP      | Set external ip or webadress of the backend                        |

### Installation

Install the dependencies:

`yarn install` or `npm install`

### Build

The frontend is served via fastify-static.

**If you already built the files for production you can skip this step.**

To build the files for production run:
`yarn build` or `npm run build` in the root directory

After building the files you can just run `yarn start` or `npm run start` to start the backend with the previously built
frontend.

## Endpoint

The main site can be found under the root path `/`

There are also extra paths to extract data or do manipulate your browsers storage which difficult to do from a mobile device
| Endpoint | description |
| -------- | ----------- |
| /reset-token | This endpoint removes the auth item from your localstorage |
| /clear-queue | This endpoint reset the queue stored in localstorage |

## Development

To serve both the front and backend you can use the following commands:

`yarn dev` or ` npm run dev`
