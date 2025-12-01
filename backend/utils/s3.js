import AWS from "aws-sdk";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: "backend/config/config.env" });

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export const upload_file = (file, folder) => {
  return new Promise((resolve, reject) => {
    // Extract base64 data from the data URL
    const base64Data = file.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename - NO FOLDER, just filename
    const fileName = `${uuidv4()}.jpg`;
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: 'image/jpeg',
    };

    console.log(`[S3] Uploading to bucket: ${params.Bucket} with key: ${params.Key}`);

    s3.upload(params, (err, data) => {
      if (err) {
        console.error('S3 upload error:', err);
        reject(err);
      } else {
        console.log('S3 upload success:', data.Location);
        resolve({
          public_id: fileName,
          url: data.Location,
        });
      }
    });
  });
};

export const delete_file = async (fileKey) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    return false;
  }
};