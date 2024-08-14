import Hapi from "@hapi/hapi";

import { listNotificationsHandler } from "../Handlers"

export const notificationsPlugin: Hapi.Plugin<void> = {
  name: "app/notifications",
  dependencies: ["prisma"],

  register: async function (server: Hapi.Server) {
    server.route({
      method: "GET",
      path: "/api/notifications",
      handler: listNotificationsHandler,
      options: {
        auth: false,
      },
    });
  },
};