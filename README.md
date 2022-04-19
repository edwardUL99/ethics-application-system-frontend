# ethics-application-system-frontend
This repository is the location of the front-end (UI) development work done for my CSIS Final Year Project implementing an Ethics Application Submission and Managamenet System for the Faculty of Science and Engineering's Ethics Committee

## Requirements
To build and run this project, you need the following:
* npm version 8.4.0

## Install
To install the project, run the following command (note that you must include the `--legacy-peer-deps` argument):
```
npm install --legacy-peer-deps
```

This will install all the dependencies for the project so that it can be run on your machine.

## Configuration
Configuration properties exist within environment files within the [environments](src/environments/) folder. The environment.ts and environment.test.ts
files are used for development and testing, while the environment.prod.ts is the environment used when building the project with `npm run build`

The most important property to set in the environment file is:
```
api_base: 'http://localhost:8080', // the URL and PORT of the backend API
```

This defines the hostname and port of the API backend. The default is set to this example as that is the default URL and port for the Java Spring Boot back-end

## Quickstart
The quickest way to get started is to run the project locally in a development environment:
```
npm start
```

## Run
To start the project quickly in a development environment, you can run the command:
```
npm start
```

or 

```
ng serve
```

When started this way, it can be accessed at http://localhost:4200

## Build
Ensure, the production environment file is configured before build.

To build the project for deployment in a development environment, you can run the following command:
```
npm run build
```

This builds the project into a static `dist` folder which can be deployed on a server. It can also be run by running the following
command:
```
node server.js
```

The port can be configured with a `PORT` environment variable