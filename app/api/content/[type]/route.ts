import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const VALID_TYPES = ['metals', 'news', 'categories', 'playbooks', 'primers', 'mechanisms'];

export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { type } = params;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  const { frontmatter, body } = await req.json();
  const slug = frontmatter?.slug;
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }
  const dir = path.join(process.cwd(), 'content', type);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, `${slug}.mdx`);
  if (fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File already exists' }, { status: 409 });
  }
  const fileContent = matter.stringify(body ?? '', frontmatter ?? {});
  fs.writeFileSync(filePath, fileContent, 'utf8');
  return NextResponse.json({ ok: true, slug });
}
