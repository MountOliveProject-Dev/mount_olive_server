import Hapi from "@hapi/hapi";
import Inert from '@hapi/inert';


import { createAudioMediaHandler } from "../Handlers/mediaHandlers";
import {createAudioFileValidator} from "../Validators";



export const mediaPlugin = {
  name: 'app/media',
  dependencies: ['prisma'],
  
  register: async function (server: Hapi.Server) {
    await server.register(Inert);  
    server.route([
      {
        method: "POST",
        path: "/upload-audio",
        handler: createAudioMediaHandler,
        options: {
          auth: false,
          payload: {
            output: "stream",
            parse: true,
            multipart: true,
            maxBytes: 104857600, // Limit to 100MB
          },
          validate: {
            payload: createAudioFileValidator,
            failAction: (request, h, err) => {
              throw err;
            },
          },
        },
      },
    ]);
  }
}