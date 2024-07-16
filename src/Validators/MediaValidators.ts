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
  createdAt: Joi.date().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  updatedAt: Joi.date().alter({
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