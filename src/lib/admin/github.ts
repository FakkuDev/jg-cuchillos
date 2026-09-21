interface GitHubFile {
  path: string;
  content: string;
  sha?: string;
}

interface CommitResult {
  success: boolean;
  commitUrl?: string;
  error?: string;
}

export class GitHubClient {
  private token: string;
  private owner: string;
  private repo: string;
  private branch: string;

  constructor(token: string, owner: string, repo: string, branch: string = 'main') {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
  }

  private async request(method: string, path: string, body?: any): Promise<any> {
    const response = await fetch(`https://api.github.com${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getFile(path: string): Promise<{ content: string; sha: string }> {
    const data = await this.request('GET', `/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`);
    const content = atob(data.content);
    return { content, sha: data.sha };
  }

  async getBranchRef(): Promise<string> {
    const data = await this.request('GET', `/repos/${this.owner}/${this.repo}/git/refs/heads/${this.branch}`);
    return data.object.sha;
  }

  async getLatestCommitSha(): Promise<string> {
    const ref = await this.getBranchRef();
    const commit = await this.request('GET', `/repos/${this.owner}/${this.repo}/git/commits/${ref}`);
    return commit.sha;
  }

  async createBlob(content: string | Blob, encoding: 'utf-8' | 'base64' = 'utf-8'): Promise<string> {
    let body: any;

    if (encoding === 'base64') {
      const arrayBuffer = await content.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      body = { content: base64, encoding: 'base64' };
    } else {
      body = { content, encoding };
    }

    const data = await this.request('POST', `/repos/${this.owner}/${this.repo}/git/blobs`, body);
    return data.sha;
  }

  async createTree(baseTreeSha: string, files: { path: string; sha: string; mode?: string; type?: string }[]): Promise<string> {
    const tree = files.map(f => ({
      path: f.path,
      sha: f.sha,
      mode: f.mode || '100644',
      type: f.type || 'blob',
    }));

    const data = await this.request('POST', `/repos/${this.owner}/${this.repo}/git/trees`, {
      base_tree: baseTreeSha,
      tree,
    });

    return data.sha;
  }

  async createCommit(message: string, treeSha: string, parentSha: string): Promise<string> {
    const data = await this.request('POST', `/repos/${this.owner}/${this.repo}/git/commits`, {
      message,
      tree: treeSha,
      parents: [parentSha],
    });

    return data.sha;
  }

  async updateRef(sha: string): Promise<void> {
    await this.request('PATCH', `/repos/${this.owner}/${this.repo}/git/refs/heads/${this.branch}`, {
      sha,
      force: false,
    });
  }

  async commitFiles(files: GitHubFile[], message: string): Promise<CommitResult> {
    try {
      const latestCommitSha = await this.getLatestCommitSha();
      const commit = await this.request('GET', `/repos/${this.owner}/${this.repo}/git/commits/${latestCommitSha}`);
      const baseTreeSha = commit.tree.sha;

      const blobs = await Promise.all(
        files.map(f => this.createBlob(f.content, f.path.endsWith('.webp') || f.path.endsWith('.png') ? 'base64' : 'utf-8'))
      );

      const tree = files.map((f, i) => ({ path: f.path, sha: blobs[i] }));
      const treeSha = await this.createTree(baseTreeSha, tree);
      const newCommitSha = await this.createCommit(message, treeSha, latestCommitSha);
      await this.updateRef(newCommitSha);

      const commitUrl = `https://github.com/${this.owner}/${this.repo}/commit/${newCommitSha}`;
      return { success: true, commitUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
