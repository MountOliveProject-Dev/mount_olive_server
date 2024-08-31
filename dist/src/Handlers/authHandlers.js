"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const googleapis_1 = require("googleapis");
const Handlers_1 = require("../Handlers");
// project_id = "mount-olive-app";
// private_key_id = "a142631e0751999a1eb3d503aa4c687b3472d463";
// client_email = "mount-olive@mount-olive-app.iam.gserviceaccount.com";
// client_id = "104255233887207032799";
// auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs";
// client_x509_cert_url =
//   "https://www.googleapis.com/robot/v1/metadata/x509/mount-olive%40mount-olive-app.iam.gserviceaccount.com";
// universe_domain = "googleapis.com";
// GOOGLE_DRIVE_FOLDER_ID = "111ZHlZisXt_swkO5mBFqH81qH4ji4fon";
exports.auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: {
        project_id: process.env.project_id,
        private_key_id: process.env.private_key_id,
        private_key: Handlers_1.GOOGLE_DRIVE_PRIVATE_KEY,
        client_email: process.env.client_email,
        client_id: process.env.client_id,
    },
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});
//# sourceMappingURL=authHandlers.js.map