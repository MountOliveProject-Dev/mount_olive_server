
import Joi from "joi";
import {folderType} from "../Helpers";


const folderInputValidator = Joi.object(
  {
    type: Joi.string().alter({
      create: (schema) => schema.valid(folderType.Audios, folderType.Images).required(),
      update: (schema) => schema.valid(folderType.Audios, folderType.Images).optional(),
    }),
    name: Joi.string().alter({
      create: (schema) => schema.required(),
      update: (schema) => schema.optional(),
    })
  }
);

export const createFolderInputValidator = folderInputValidator.tailor("create");
export const updateFolderInputValidator = folderInputValidator.tailor("update");
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
  name: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  description: Joi.string().alter({
    create: (schema) => schema.optional(),
    update: (schema) => schema.optional(),
  }),
  filePath: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  reUploadMedia: Joi.boolean().alter({
    create: (schema) => schema.forbidden(),
    update: (schema) => schema.required(),
  }),
  mimeType: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  uniqueId: Joi.string().alter({
    create: (schema) => schema.forbidden(),
    update: (schema) => schema.required(),
  }),
});


export const createAudioFileValidator = audioFileValidator.tailor("create");
export const updateAudioFileValidator = audioFileValidator.tailor("update");

