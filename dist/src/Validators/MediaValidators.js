"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMediaInputValidator = exports.createMediaInputValidator = void 0;
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
    coverPhoto: joi_1.default.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
    }),
    source: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    duration: joi_1.default.number().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    type: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    category: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    createdAt: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    updatedAt: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    viewCount: joi_1.default.number().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    likeCount: joi_1.default.number().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
});
exports.createMediaInputValidator = mediaInputValidator.tailor("create");
exports.updateMediaInputValidator = mediaInputValidator.tailor("update");
//# sourceMappingURL=MediaValidators.js.map