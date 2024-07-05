import dotenv from 'dotenv';
import Hapi from '@hapi/hapi';

import { pm2plugin, prismaPlugin } from "./Plugins";
declare module '@hapi/hapi' {
    interface ServerApplicationState {}
  }

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const server: Hapi.Server = Hapi.server({
  port: process.env.PORT || 8001,
  host: process.env.HOST || "localhost",
  routes: {
    cors: {
      origin: ["*"],
      credentials: true,
      headers: ["Accept", "Content-Type", "Authorization"],
      additionalHeaders: ["cache-control", "x-requested-with"],
      exposedHeaders: ["Access-Control-Allow-Origin"],
    },
  },
});

export default server;

export async function createServer(): Promise<Hapi.Server> {
  if (!isProduction) {
    console.log("Running in development mode...");
  } else {
    console.log("Running in production mode...");
  }

  await server.register([prismaPlugin,pm2plugin]);

  await server.initialize();

  return server;
}

export async function startServer(server: Hapi.Server): Promise<Hapi.Server> {
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
  return server;
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
