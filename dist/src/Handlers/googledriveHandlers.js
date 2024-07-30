"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_DRIVE_PRIVATE_KEY = void 0;
exports.listAndShareAudioFiles = listAndShareAudioFiles;
const googleapis_1 = require("googleapis");
exports.GOOGLE_DRIVE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCqBclF/xfl/ttV\noWmiCDf7wltvHg2BreumPmxK+ixTvhHJk0J2uUAYna03KPfeDrs1YVwC7r8FE1+C\nRva3Nh9seQIvNAicH/5s6M38WAiF6LnZNKRbbwEGXfu+Ze1iyUe1QWHrzkbKazUa\nXamCb96HI6CvMCxsd568Z1pHNZsykdSq08bJUwRY1qlvnsCObsrtzxpbrbY7Z8vH\nDJDtk3jf0NVHBspQZlPum489k1Qi3xRSFUtrcTcicCilqru+5G1X0Mtej1+u5Nc1\n7RpdbmVPVEwjd8oJ2tFdZi8d+RQ3x0jIovOp0ZOkHxMuONP/bWUjq8RVF9gvHOWY\nVJSpreVjAgMBAAECggEABzqwNYPwKT6YZvpgymdbgx6wniBRUeJ7q4skNhgbV/HW\n8GovqQ16mhRBKLd96MG2xuQ6jzDRIrrLpg7AqfWGCYcE8BOC/3r8mDzOahmyhCsZ\nrD8LuRe5hHoERWF2kI5q20T+eO9BozfOYlzWtOJAjcNz0h2rTeNgAkH4Yn28+UmM\nxb7E76Rrec049FKxFXSyOl/YpJ4FyqYt+EwVHSgQIrX8JWAxPN0Q9WfvhLwMJO4R\nH4nT564QWlUsuxIALQ5AMaHF85ybOnMqarUYQgo/8HrhFrNdQnIGovdIll83u0D9\n48ZGkeTkjrI8EHdBaZImT2OSlh6VSRB4VmLGxhjG9QKBgQDexMigxoDCGm+3/ciN\nljiC8TPsoL47WQHNw9uLDqjP+IcetUQsjnZvRTGsM0w0exyiG5KPLQvNeIo6DFAQ\nWzGM0yPV0I4aV9BfrMCP31sVrMQ/pCgq2o6fGvSLE1vEEvmWKeXWaGnAoP5O6IJc\nUKwhgJa70ue52kvZN6kCeebblQKBgQDDYrSO6pKqotvdNFE7bcYa+RiHB59DGafi\nap0rMG8HLEluCQddf64oIANZABqFJJOzeL+Lgs2wWWs3A83qs9tI27hLCVITWJJ1\nzU9lT5j8YHi6kXwDwasH0Bd1ZUK9+JTrC23WcmRBEzc6yySu78aEDM79a7Xlad9u\nPTtdMKy/FwKBgQDV+2BcT1DPImW97uD+YBXYcajW23DfwReid0gjwukVHD1umd/q\njM3nBCg6qOvCXZ+bd7DIJxT3QZpFOB6QF4j5JLd/Yt2dIEzgGii+CmaL43B/UUfk\nIhxtaI8OKII1TaTBQW2tDo7God6mHWFbG4K8i7A+qtA8DhxdgsGtxzqiIQKBgQCC\ngai3GWnz/io7u9lSh8VeeOnwL6AqkrV339yxX32Z3fQCQpef1Uv/0zpJNW+BZWge\n5dWTm0BGvcOGkMz3K0GajeCwhj5DW9MgSo3wztUSJmIdxFWAsNjLtCwnJwcIm0Tl\nJtIr/maGrQ4kAFK1YsVHqMKNtWdfIHO0T8QaQAvy6wKBgQDNX21Iic2upEV/ZiSe\nFxeyiaU44ptFRsMg0mcu/+6ekv7aD6SDnUHpsJjJ5/a0cr5VCbhnixbLzG+4V9Yn\n95JQAEz5dMBmsdiJwJNh7D1y0pso/FFckPZNUgsW7sc+Q2Jlt/z7KqnD5KKhFRgW\n5CEn1bpDgCrebZFjUzmQPzr/Cg==\n-----END PRIVATE KEY-----\n";
async function listAndShareAudioFiles() {
    // Initialize the GoogleAuth object with the necessary credentials
    const auth = new googleapis_1.google.auth.GoogleAuth({
        credentials: {
            type: process.env.GOOGLE_DRIVE_TYPE,
            project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
            private_key_id: process.env.GOOGLE_DRIVE_PRIVATE_KEY_ID,
            private_key: exports.GOOGLE_DRIVE_PRIVATE_KEY,
            client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
        },
        scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    // Initialize the Drive API client
    const drive = googleapis_1.google.drive({
        version: "v3",
        auth,
    });
    // Define the folder ID and MIME types for audio files
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID; // Replace with your actual folder ID
    const audioMimeTypes = [
        "audio/mpeg", // .mp3
        "audio/wav", // .wav
        "audio/x-wav",
        "audio/vnd.wave",
        "audio/ogg", // .ogg
        "audio/flac", // .flac
        "audio/aac", // .aac
        "audio/x-aac",
    ];
    try {
        // List files in the folder
        const listParams = {
            q: `'${folderId}' in parents and mimeType contains 'audio/' and trashed = false`,
            fields: 'files(id, name, mimeType)',
        };
        const res = await drive.files.list(listParams);
        const listResults = res.data.files || [];
        console.log('Audio files in the folder:', listResults.length);
        console.log(listResults);
        // Filter audio files
        const audioFiles = listResults.filter(file => audioMimeTypes.includes(file.mimeType));
        // Share files and get links
        for (const file of audioFiles) {
            const fileId = file.id;
            if (!fileId) {
                console.warn(`File ID is missing for file: ${file.name}`);
                continue;
            }
            else {
                console.log(`Sharing fileId: ${fileId}`);
                // Set file permissions to public
                await drive.permissions.create({
                    fileId: file.id,
                    requestBody: {
                        role: "reader",
                        type: "anyone",
                    },
                });
                // Generate shareable link
                const link = `https://drive.google.com/file/d/${file.id}/view?usp=sharing`;
                console.log(`Name: ${file.name}, Shareable Link: ${link}`);
            }
        }
    }
    catch (error) {
        console.error('Error listing or sharing audio files:', error);
    }
}
//# sourceMappingURL=googledriveHandlers.js.map