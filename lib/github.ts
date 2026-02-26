const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'paleofoundation/heavymetaltested';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const API_BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents`;

export function isGitHubEnabled() {
  return !!GITHUB_TOKEN;
}

function headers() {
  return {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

async function getFileSha(repoPath: string): Promise<string | null> {
  const res = await fetch(`${API_BASE}/${repoPath}?ref=${GITHUB_BRANCH}`, {
    headers: headers(),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha ?? null;
}

export async function writeFileToGitHub(
  repoPath: string,
  content: string,
  commitMessage: string,
): Promise<{ ok: boolean; error?: string }> {
  const sha = await getFileSha(repoPath);

  const payload: Record<string, string> = {
    message: commitMessage,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch: GITHUB_BRANCH,
  };
  if (sha) payload.sha = sha;

  const res = await fetch(`${API_BASE}/${repoPath}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.message || `GitHub API error (${res.status})` };
  }
  return { ok: true };
}

export async function deleteFileFromGitHub(
  repoPath: string,
  commitMessage: string,
): Promise<{ ok: boolean; error?: string }> {
  const sha = await getFileSha(repoPath);
  if (!sha) {
    return { ok: false, error: 'File not found on GitHub' };
  }

  const res = await fetch(`${API_BASE}/${repoPath}`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({
      message: commitMessage,
      sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.message || `GitHub API error (${res.status})` };
  }
  return { ok: true };
}

export async function fileExistsOnGitHub(repoPath: string): Promise<boolean> {
  const sha = await getFileSha(repoPath);
  return sha !== null;
}
