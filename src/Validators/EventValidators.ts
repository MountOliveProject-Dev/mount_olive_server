import Joi from "joi";

const eventInputValidator = Joi.object({
  id: Joi.number().alter({
    create: (schema) => schema.forbidden(),
    update: (schema) => schema.required(),
  }),
  title: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  uniqueId: Joi.string().alter({
    create: (schema) => schema.forbidden(),
    update: (schema) => schema.required(),
  }),
  date: Joi.date().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  host: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  description: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  thumbnail: Joi.string().alter({
    create: (schema) => schema.optional(),
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
});

export const createEventInputValidator = eventInputValidator.tailor("create");
export const updateEventInputValidator = eventInputValidator.tailor("update");