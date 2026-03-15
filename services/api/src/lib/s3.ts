import AWS from 'aws-sdk';
import { config } from '@mindfuel/config';

const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

export const uploadFile = async (
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> => {
  const params: AWS.S3.PutObjectRequest = {
    Bucket: config.aws.s3Bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read',
  };

  await s3.putObject(params).promise();
  return `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
};

export const deleteFile = async (key: string): Promise<void> => {
  const params: AWS.S3.DeleteObjectRequest = {
    Bucket: config.aws.s3Bucket,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};

export const getSignedUrl = (key: string, expiresIn: number = 3600): string => {
  return s3.getSignedUrl('getObject', {
    Bucket: config.aws.s3Bucket,
    Key: key,
    Expires: expiresIn,
  });
};
