"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAudioFileValidator = exports.createAudioFileValidator = exports.updateVideoMediaInputValidator = exports.createVideoMediaInputValidator = exports.updateMediaInputValidator = exports.createMediaInputValidator = exports.updateFolderInputValidator = exports.createFolderInputValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const Helpers_1 = require("../Helpers");
const folderInputValidator = joi_1.default.object({
    type: joi_1.default.string().alter({
        create: (schema) => schema.valid(Helpers_1.folderType.Audios, Helpers_1.folderType.Images).required(),
        update: (schema) => schema.valid(Helpers_1.folderType.Audios, Helpers_1.folderType.Images).optional().allow(""),
    }),
    name: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
});
exports.createFolderInputValidator = folderInputValidator.tailor("create");
exports.updateFolderInputValidator = folderInputValidator.tailor("update");
const mediaInputValidator = joi_1.default.object({
    title: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    description: joi_1.default.string().alter({
        create: (schema) => schema.optional().allow(""),
        update: (schema) => schema.optional().allow(""),
    }),
    url: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    duration: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    uniqueId: joi_1.default.string().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.required(),
    }),
    category: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    createdAt: joi_1.default.string().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.optional().allow(""),
    }),
    updatedAt: joi_1.default.string().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.optional().allow(""),
    }),
});
exports.createMediaInputValidator = mediaInputValidator.tailor("create");
exports.updateMediaInputValidator = mediaInputValidator.tailor("update");
const videoMediaInputValidator = joi_1.default.object({
    url: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    uniqueId: joi_1.default.string().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.required(),
    }),
    title: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    description: joi_1.default.string().alter({
        create: (schema) => schema.optional().allow(""),
        update: (schema) => schema.optional().allow(""),
    }),
});
exports.createVideoMediaInputValidator = videoMediaInputValidator.tailor("create");
exports.updateVideoMediaInputValidator = videoMediaInputValidator.tailor("update");
const audioFileValidator = joi_1.default.object({
    name: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    host: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    description: joi_1.default.string().alter({
        create: (schema) => schema.optional().allow(""),
        update: (schema) => schema.optional().allow(""),
    }),
    filePath: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    reUploadMedia: joi_1.default.boolean().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.required(),
    }),
    mimeType: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    uniqueId: joi_1.default.string().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.required(),
    }),
});
exports.createAudioFileValidator = audioFileValidator.tailor("create");
exports.updateAudioFileValidator = audioFileValidator.tailor("update");
//# sourceMappingURL=MediaValidators.js.map