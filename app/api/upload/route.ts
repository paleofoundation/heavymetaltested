import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isGitHubEnabled, writeBinaryToGitHub } from '@/lib/github';
import path from 'node:path';
import fs from 'node:fs';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const destination = formData.get('destination') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: `File type ${ext} not allowed. Use: ${ALLOWED_EXTENSIONS.join(', ')}` },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  const folder = destination || 'public/images/authors';
  const repoPath = `${folder}/${safeName}`;
  const publicPath = `/${repoPath.replace(/^public\//, '')}`;

  const arrayBuf = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuf).toString('base64');

  if (isGitHubEnabled()) {
    const result = await writeBinaryToGitHub(repoPath, base64, `Upload ${safeName}`);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ path: publicPath, via: 'github' });
  }

  const fullPath = path.join(process.cwd(), repoPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, Buffer.from(arrayBuf));
  return NextResponse.json({ path: publicPath, via: 'local' });
}
