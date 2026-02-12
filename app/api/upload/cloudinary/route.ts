import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifyAdminAuthToken } from '@/lib/auth';
import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_LABEL = 'JPEG, PNG, WebP';

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('adminAuthToken')?.value ?? '';

  if (!verifyAdminAuthToken(token)) {
    return Response.json(
      { message: 'Unauthorized. Please log in as admin.' },
      { status: 401 },
    );
  }

  // Check Cloudinary credentials
  if (!isCloudinaryConfigured()) {
    return Response.json(
      { message: 'Cloudinary is not configured. Contact the site administrator.' },
      { status: 500 },
    );
  }

  // Parse multipart form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { message: 'Invalid request. Expected multipart/form-data with a file.' },
      { status: 400 },
    );
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return Response.json(
      { message: 'No file provided. Include a "file" field in the form data.' },
      { status: 400 },
    );
  }

  // Validate file type
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return Response.json(
      { message: `Unsupported file type: ${file.type}. Accepted formats: ${ACCEPTED_LABEL}.` },
      { status: 400 },
    );
  }

  // Convert file to base64 data URI for Cloudinary upload
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  // Upload to Cloudinary
  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'image',
      folder: process.env.CLOUDINARY_FOLDER,
    });

    return Response.json({
      src: result.secure_url,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('[cloudinary-upload] Upload failed:', error);
    return Response.json(
      { message: 'Upload failed. Please try again.' },
      { status: 500 },
    );
  }
}
