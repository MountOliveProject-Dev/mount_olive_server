"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestType = exports.LogType = exports.folderType = exports.NotificationType = exports.MediaType = void 0;
var MediaType;
(function (MediaType) {
    MediaType["VIDEO"] = "Video";
    MediaType["AUDIO"] = "Audio";
    MediaType["IMAGE"] = "Image";
})(MediaType || (exports.MediaType = MediaType = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["VIDEO"] = "Video";
    NotificationType["AUDIO"] = "Audio";
    NotificationType["IMAGE"] = "Image";
    NotificationType["EVENT"] = "Event";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var folderType;
(function (folderType) {
    folderType["Audios"] = "Audios";
    folderType["Images"] = "Images";
})(folderType || (exports.folderType = folderType = {}));
var LogType;
(function (LogType) {
    LogType["INFO"] = "Info";
    LogType["ERROR"] = "Error";
    LogType["WARNING"] = "Warning";
})(LogType || (exports.LogType = LogType = {}));
var RequestType;
(function (RequestType) {
    RequestType["CREATE"] = "Create";
    RequestType["UPDATE"] = "Update";
    RequestType["DELETE"] = "Delete";
    RequestType["READ"] = "Read";
})(RequestType || (exports.RequestType = RequestType = {}));
//# sourceMappingURL=types.js.map