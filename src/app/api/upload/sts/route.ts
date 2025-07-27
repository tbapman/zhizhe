import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface STSParams {
  accessKeyId: string;
  accessKeySecret: string;
  roleArn: string;
  bucket: string;
  region: string;
}

function generateSTS({ 
  accessKeyId, 
  accessKeySecret, 
  roleArn, 
  bucket, 
  region 
}: STSParams) {
  const policy = {
    Statement: [
      {
        Effect: 'Allow',
        Action: [
          'oss:PutObject',
          'oss:PutObjectAcl'
        ],
        Resource: [
          `acs:oss:${region}:${accessKeyId}:${bucket}/*`,
          `acs:oss:${region}:${accessKeyId}:${bucket}`
        ]
      }
    ],
    Version: '1'
  };

  const policyBase64 = Buffer.from(JSON.stringify(policy)).toString('base64');
  const expiration = new Date(Date.now() + 3600 * 1000).toISOString();
  
  const signature = crypto
    .createHmac('sha1', accessKeySecret)
    .update(policyBase64)
    .digest('base64');

  return {
    accessKeyId,
    securityToken: 'mock-security-token',
    policy: policyBase64,
    signature,
    expiration,
    bucket,
    region
  };
}

export async function POST(request: NextRequest) {
  try {
    const { filename, type } = await request.json();
    
    const sts = generateSTS({
      accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID!,
      accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET!,
      roleArn: process.env.ALIYUN_OSS_STS_ROLE_ARN!,
      bucket: process.env.ALIYUN_OSS_BUCKET!,
      region: process.env.ALIYUN_OSS_REGION!
    });

    const key = `uploads/${Date.now()}-${filename}`;
    const uploadUrl = `https://${sts.bucket}.${sts.region}.aliyuncs.com/${key}`;

    return NextResponse.json({
      uploadUrl,
      key,
      ...sts
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate upload credentials' },
      { status: 500 }
    );
  }
}