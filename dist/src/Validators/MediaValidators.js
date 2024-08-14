"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAudioFileValidator = exports.updateMediaInputValidator = exports.createMediaInputValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const mediaInputValidator = joi_1.default.object({
    id: joi_1.default.number().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.required(),
    }),
    title: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    description: joi_1.default.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
    }),
    thumbnail: joi_1.default.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
    }),
    url: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    duration: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    uniqueId: joi_1.default.string().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.required(),
    }),
    category: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    createdAt: joi_1.default.string().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.optional(),
    }),
    updatedAt: joi_1.default.string().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.optional(),
    }),
});
exports.createMediaInputValidator = mediaInputValidator.tailor("create");
exports.updateMediaInputValidator = mediaInputValidator.tailor("update");
const audioFileValidator = joi_1.default.object({
    audioFile: joi_1.default.object({
        hapi: joi_1.default.object({
            filename: joi_1.default.string().required(),
            headers: joi_1.default.object({
                "content-type": joi_1.default.string().valid("audio/mpeg", "audio/wav", "audio/x-wav", "audio/vnd.wave", "audio/ogg", "audio/flac", "audio/aac", "audio/x-aac").required(),
            }).required(),
        }).required(),
        path: joi_1.default.string().required(),
    }).required(),
});
exports.createAudioFileValidator = audioFileValidator.tailor("create");
//# sourceMappingURL=MediaValidators.js.map