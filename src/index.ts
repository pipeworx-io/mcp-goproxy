interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Go Module Proxy MCP.
 *
 * Auth: none. Docs: https://proxy.golang.org/
 */


const BASE = 'https://proxy.golang.org';
const UA = 'pipeworx-mcp-goproxy/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  { name: 'module', description: 'Most recent version + metadata.', inputSchema: { type: 'object', properties: { module_path: { type: 'string' } }, required: ['module_path'] } },
  { name: 'versions', description: 'List available versions.', inputSchema: { type: 'object', properties: { module_path: { type: 'string' } }, required: ['module_path'] } },
  { name: 'version_info', description: 'Version metadata.', inputSchema: { type: 'object', properties: { module_path: { type: 'string' }, version: { type: 'string' } }, required: ['module_path', 'version'] } },
  { name: 'go_mod', description: 'go.mod content.', inputSchema: { type: 'object', properties: { module_path: { type: 'string' }, version: { type: 'string' } }, required: ['module_path'] } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const mp = encodeModulePath(reqStr(args, 'module_path', '"github.com/gin-gonic/gin"'));
  switch (name) {
    case 'module':
      return goJson(`/${mp}/@latest`);
    case 'versions': {
      const text = await goText(`/${mp}/@v/list`);
      return { module_path: reqStr(args, 'module_path', ''), versions: text.split('\n').filter(Boolean) };
    }
    case 'version_info':
      return goJson(`/${mp}/@v/${encodeURIComponent(reqStr(args, 'version', '"v1.10.0"'))}.info`);
    case 'go_mod': {
      const v = args.version ? String(args.version) : (await goJson(`/${mp}/@latest`) as { Version: string }).Version;
      const body = await goText(`/${mp}/@v/${encodeURIComponent(v)}.mod`);
      return { module_path: reqStr(args, 'module_path', ''), version: v, body };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/** Go module proxy encodes uppercase characters as "!<lower>". */
function encodeModulePath(p: string): string {
  return p.replace(/[A-Z]/g, (c) => `!${c.toLowerCase()}`);
}

async function goJson(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Go proxy: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

async function goText(path: string): Promise<string> {
  const res = await fetch(`${BASE}${path}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Go proxy: ${res.status}`);
  return res.text();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
