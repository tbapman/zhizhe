interface UploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export async function uploadToOSS({ 
  file, 
  onProgress, 
  onSuccess, 
  onError 
}: UploadOptions) {
  try {
    // 获取上传凭证
    const response = await fetch('/api/upload/sts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        type: file.type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload credentials');
    }

    const { uploadUrl, key, ...credentials } = await response.json();

    // 创建FormData
    const formData = new FormData();
    formData.append('key', key);
    formData.append('policy', credentials.policy);
    formData.append('OSSAccessKeyId', credentials.accessKeyId);
    formData.append('signature', credentials.signature);
    formData.append('x-oss-security-token', credentials.securityToken);
    formData.append('file', file);

    // 上传文件
    const xhr = new XMLHttpRequest();
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress?.(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 204) {
        const fileUrl = `https://${credentials.bucket}.${credentials.region}.aliyuncs.com/${key}`;
        onSuccess?.(fileUrl);
      } else {
        onError?.(new Error('Upload failed'));
      }
    };

    xhr.onerror = () => {
      onError?.(new Error('Upload error'));
    };

    xhr.open('POST', uploadUrl);
    xhr.send(formData);

    return xhr;
  } catch (error) {
    onError?.(error as Error);
  }
}

export async function generateImageUrl(fileUrl: string, width?: number, height?: number) {
  if (!fileUrl) return '';
  
  let url = fileUrl;
  if (width || height) {
    const params = new URLSearchParams();
    if (width) params.append('x-oss-process', `image/resize,w_${width}`);
    if (height) params.append('x-oss-process', `image/resize,h_${height}`);
    url = `${fileUrl}?${params.toString()}`;
  }
  
  return url;
}