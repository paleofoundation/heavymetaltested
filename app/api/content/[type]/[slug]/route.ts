import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const VALID_TYPES = ['metals', 'news', 'categories', 'playbooks', 'primers', 'mechanisms'];

function contentPath(type: string, slug: string) {
  return path.join(process.cwd(), 'content', type, `${slug}.mdx`);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { type: string; slug: string } },
) {
  const { type, slug } = params;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  const filePath = contentPath(type, slug);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  return NextResponse.json({ frontmatter: data, body: content });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { type: string; slug: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { type, slug } = params;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  const filePath = contentPath(type, slug);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const { frontmatter, body } = await req.json();
  const fileContent = matter.stringify(body ?? '', frontmatter ?? {});
  fs.writeFileSync(filePath, fileContent, 'utf8');
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { type: string; slug: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { type, slug } = params;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  const filePath = contentPath(type, slug);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  fs.unlinkSync(filePath);
  return NextResponse.json({ ok: true });
}
