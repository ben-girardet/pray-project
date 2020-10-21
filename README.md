# aurelia-saas-starter
An all-inclusive starter for building Aurelia applications. Node.js + Express + Postgres and Aurelia 2's eleven herbs and spices.

## Installation

- In the root of the project enter `npm install` which will take care of installing Node dependencies for both `client` and `server`
- Configure your application by renaming `.env.sample` to `.env` and replace your config values

> If you don't have PostgreSQL installed make use of the provided `docker-compose.yml` file by running `docker-compose up` inside of the `server` folder. All configuration will be read from your `.env` file. Your DB will be up and ready on localhost port `5432` and a minimalistic db-browser (adminer) at `8080`.

- Setup the database by running `npm run-script setup:db` inside of the `server` directory