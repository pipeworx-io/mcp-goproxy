# @pipeworx/goproxy

Go module proxy MCP — module info, versions, latest release, and `go.mod` content via the Go module proxy protocol. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `module(module_path)` — most recent version + metadata
- `versions(module_path)` — list available versions
- `version_info(module_path, version)` — version metadata (timestamp, etc.)
- `go_mod(module_path, version?)` — fetch `go.mod` content

## Data source

`https://proxy.golang.org/<module>/...`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "goproxy": {
      "url": "https://gateway.pipeworx.io/goproxy/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Goproxy data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
