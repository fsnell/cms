import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';

function getS3Client(): S3Client {
  const endpoint = process.env.S3_ENDPOINT_URL;
  if (endpoint) {
    return new S3Client({
      endpoint,
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
    });
  }
  return new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
}

const BUCKET = () => process.env.S3_BUCKET_NAME!;

export async function uploadToS3(localPath: string, s3Key: string, mimeType: string): Promise<string> {
  const body = fs.readFileSync(localPath);
  const bucket = BUCKET();
  try {
    await getS3Client().send(new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: body,
      ContentType: mimeType,
    }));
  } catch (err: any) {
    console.error('[S3:upload] Failed to upload object', {
      bucket,
      key: s3Key,
      mimeType,
      region: process.env.AWS_REGION,
      endpoint: process.env.S3_ENDPOINT_URL,
      name: err?.name,
      code: err?.Code || err?.code,
      statusCode: err?.$metadata?.httpStatusCode,
      requestId: err?.$metadata?.requestId,
      message: err?.message,
    });
    throw err;
  }
  return s3Key;
}

export async function generatePresignedUrl(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET(), Key: s3Key });
  return getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
}
