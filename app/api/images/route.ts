import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    const files = await fs.readdir(uploadsDir);
    const imageFiles = files.filter(file => 
      ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(
        path.extname(file).toLowerCase()
      )
    );
    return NextResponse.json({ images: imageFiles });
  } catch (err) {
    console.error('Error reading uploads directory:', err);
    return NextResponse.json({ error: 'Unable to scan directory' }, { status: 500 });
  }
}