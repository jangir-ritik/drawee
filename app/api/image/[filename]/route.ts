import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;
  const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

  if (fs.existsSync(filepath)) {
    const fileBuffer = fs.readFileSync(filepath);
    const fileType = path.extname(filename).toLowerCase();
    
    let contentType = 'image/png'; // Default content type
    switch (fileType) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } else {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}