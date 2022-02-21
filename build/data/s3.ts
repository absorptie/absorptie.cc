import {
	DeleteObjectsCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'

import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from './constants.js'

const S3Bucket = 's3.postanu.com'
const S3BucketFolder = 'absorptie/images'

export const S3 = new S3Client({
	region: 'eu-north-1',
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY
	}
})

export async function uploadImage (
	buffer: Buffer,
	extension: string,
	s3folder: string
): Promise<string> {
	let Key = `${S3BucketFolder}/${s3folder}/${nanoid()}.${extension}`
	await S3.send(
		new PutObjectCommand({
			Key,
			Body: buffer,
			Bucket: S3Bucket,
			ACL: 'public-read'
		})
	)
	return `https://${S3Bucket}/${Key}`
}

export async function cleanupBucketFolder (folder: string): Promise<void> {
	let list = await S3.send(
		new ListObjectsV2Command({
			Bucket: S3Bucket,
			Prefix: `${S3BucketFolder}/${folder}`
		})
	)
	if (!list.Contents) return
	await S3.send(
		new DeleteObjectsCommand({
			Bucket: S3Bucket,
			Delete: {
				Objects: list.Contents.map(item => ({ Key: item.Key }))
			}
		})
	)
}
