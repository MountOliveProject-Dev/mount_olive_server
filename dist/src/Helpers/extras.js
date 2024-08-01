"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentDate = void 0;
const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return day + "-" + month + "-" + year;
};
exports.getCurrentDate = getCurrentDate;
//# sourceMappingURL=extras.js.map