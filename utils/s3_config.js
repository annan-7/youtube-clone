import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config({ path: ".env" });

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;
const defaultObjectAcl = process.env.AWS_S3_OBJECT_ACL;

const clientConfig = {
  region,
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const s3Client = new S3Client(clientConfig);

const getContentType = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".mp4") return "video/mp4";
  if (extension === ".mov") return "video/quicktime";
  if (extension === ".avi") return "video/x-msvideo";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".m3u8") return "application/vnd.apple.mpegurl";
  if (extension === ".ts") return "video/mp2t";

  return "application/octet-stream";
};

const buildPublicUrl = (key) => {
  const customBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;

  if (customBaseUrl) {
    const trimmedBaseUrl = customBaseUrl.replace(/\/$/, "");
    return `${trimmedBaseUrl}/${key}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const uploadOnS3 = async (filePath, options = {}) => {
  try {
    if (!filePath || !bucket || !region) return null;

    const {
      folder = "uploads",
      keyPrefix = "",
      keySuffix = "",
      contentType,
      key,
      acl,
    } = options;

    const baseName = path.basename(filePath).replace(/\s+/g, "-");
    const objectKey = key || `${folder}/${keyPrefix}${Date.now()}-${baseName}${keySuffix}`;
    const body = await fs.promises.readFile(filePath);

    const selectedAcl = acl || defaultObjectAcl;

    const commandInput = {
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: contentType || getContentType(filePath),
    };

    if (selectedAcl) {
      commandInput.ACL = selectedAcl;
    }

    const command = new PutObjectCommand(commandInput);

    const uploadedFile = await s3Client.send(command);

    return {
      key: objectKey,
      bucket,
      region,
      etag: uploadedFile.ETag,
      url: buildPublicUrl(objectKey),
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export { uploadOnS3 };