import Hapi from '@hapi/hapi';
import { google } from 'googleapis';


    // Configure the Google Drive API client
const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            project_id: process.env.GOOGLE_PROJECT_ID,
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function createFile(folderId: string) {
        
         const fileMetadata = {
           name: "sample-file.txt",
           parents: [folderId],
         };
         const media = {
           mimeType: "text/plain",
           body: "Hello, World!",
         };

         const response = await drive.files.create({
           requestBody: fileMetadata,
           media: media,
           fields: "id",
         });

        console.log(response);
}
async function createFolder(name: string) {
        const fileMetadata = {
          name: name,
          mimeType: "application/vnd.google-apps.folder",
        };
        const response = await drive.files.create({
          requestBody: fileMetadata,
          fields: "id",
        });

        console.log(response);
        return response.data.id;

}
async function listFiles(){
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        const response = await drive.files.list({
          q: `'${folderId}' in parents`,
          fields: "files(id, name)",
        });

        console.log(response.data.files);
}
const folderId =  createFolder("sample-folder");

createFile(folderId?.toString());
listFiles();




