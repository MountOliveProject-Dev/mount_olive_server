import { url } from "inspector";
import Joi from "joi";

const mediaInputValidator = Joi.object({
  title: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  description: Joi.string().alter({
    create: (schema) => schema.optional(),
    update: (schema) => schema.optional(),
  }),
  url: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  duration: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  uniqueId: Joi.string().alter({
    create: (schema) => schema.forbidden(),
    update: (schema) => schema.required(),
  }),
  category: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  createdAt: Joi.string().alter({
    create: (schema) => schema.forbidden(),
    update: (schema) => schema.optional(),
  }),
  updatedAt: Joi.string().alter({
    create: (schema) => schema.forbidden(),
    update: (schema) => schema.optional(),
  }),
});

export const createMediaInputValidator = mediaInputValidator.tailor("create");
export const updateMediaInputValidator = mediaInputValidator.tailor("update");

const videoMediaInputValidator = Joi.object({
  url: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  uniqueId: Joi.string().alter({
    create: (schema) => schema.forbidden(),
    update: (schema) => schema.required(),
  }),
  title: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  description: Joi.string().alter({
    create: (schema) => schema.optional(),
    update: (schema) => schema.optional(),
  }),
});

export const createVideoMediaInputValidator = videoMediaInputValidator.tailor("create");
export const updateVideoMediaInputValidator = videoMediaInputValidator.tailor("update");
const audioFileValidator = Joi.object({
  audioFile: Joi.object({
    hapi: Joi.object({
      filename: Joi.string().required(),
      headers: Joi.object({
        "content-type": Joi.string().valid(
            "audio/mpeg",
            "audio/wav",
            "audio/x-wav",
            "audio/vnd.wave",
            "audio/ogg",
            "audio/flac",
            "audio/aac",
            "audio/x-aac"
          ).required(),
      }).required(),
    }).required(),
    path: Joi.string().required(),
  }).required(),
});

export const createAudioFileValidator = audioFileValidator.tailor("create");


