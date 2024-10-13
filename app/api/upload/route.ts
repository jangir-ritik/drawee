// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const files = data.getAll('images') as File[];
    const convertedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.png';
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

      await sharp(buffer)
        .png()
        .toFile(filepath);

      convertedFiles.push({
        filename: filename,
        originalname: file.name
      });
    }

    return NextResponse.json({ files: convertedFiles }, { status: 200 });
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}