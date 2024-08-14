import Joi from "joi";

const mediaInputValidator = Joi.object({
  id: Joi.number().alter({
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
  coverPhoto: Joi.string().alter({
    create: (schema) => schema.optional(),
    update: (schema) => schema.optional(),
  }),

  source: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  duration: Joi.number().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  type: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  category: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  createdAt: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  updatedAt: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  viewCount: Joi.number().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  likeCount: Joi.number().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
});

export const createMediaInputValidator = mediaInputValidator.tailor("create");
export const updateMediaInputValidator = mediaInputValidator.tailor("update");

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