export interface Resource {
  name: string
  url: string
  host: string
}

export interface ResourceGroup {
  title: string
  icon: 'docs' | 'courses' | 'reading' | 'practice'
  items: Resource[]
}

export const EXAM_GUIDE_URL =
  'https://anthropic.skilljar.com/claude-certified-architect-foundations-certification'

export const RESOURCES: ResourceGroup[] = [
  {
    title: 'Documentación',
    icon: 'docs',
    items: [
      { name: 'Claude Docs', url: 'https://platform.claude.com/docs/en/intro', host: 'platform.claude.com/docs' },
      { name: 'Tool use', url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview', host: 'platform.claude.com/…/tool-use' },
      { name: 'Claude Code', url: 'https://code.claude.com/docs/en/overview', host: 'code.claude.com/docs' },
      { name: 'Model Context Protocol', url: 'https://modelcontextprotocol.io', host: 'modelcontextprotocol.io' },
    ],
  },
  {
    title: 'Cursos',
    icon: 'courses',
    items: [
      { name: 'Anthropic Academy', url: 'https://anthropic.skilljar.com', host: 'anthropic.skilljar.com' },
      { name: 'Anthropic Courses', url: 'https://github.com/anthropics/courses', host: 'github.com/anthropics/courses' },
      { name: 'Prompt Eng. Tutorial', url: 'https://github.com/anthropics/prompt-eng-interactive-tutorial', host: 'github.com/anthropics/prompt-eng-…' },
      { name: 'Intro to MCP', url: 'https://anthropic.skilljar.com/introduction-to-model-context-protocol', host: 'anthropic.skilljar.com/…mcp' },
    ],
  },
  {
    title: 'Lecturas clave',
    icon: 'reading',
    items: [
      { name: 'Building effective agents', url: 'https://www.anthropic.com/engineering/building-effective-agents', host: 'anthropic.com/engineering' },
      { name: 'Effective context engineering', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', host: 'anthropic.com/engineering' },
      { name: 'Writing tools for agents', url: 'https://www.anthropic.com/engineering/writing-tools-for-agents', host: 'anthropic.com/engineering' },
      { name: 'Claude Code best practices', url: 'https://code.claude.com/docs/en/best-practices', host: 'code.claude.com/…/best-practices' },
    ],
  },
  {
    title: 'Práctica',
    icon: 'practice',
    items: [
      { name: 'Claude Cookbooks', url: 'https://github.com/anthropics/claude-cookbooks', host: 'github.com/anthropics/claude-cookbooks' },
      { name: 'Claude Agent SDK', url: 'https://code.claude.com/docs/en/agent-sdk/overview', host: 'code.claude.com/…/agent-sdk' },
      { name: 'MCP reference servers', url: 'https://github.com/modelcontextprotocol/servers', host: 'github.com/modelcontextprotocol' },
      { name: 'Console Workbench', url: 'https://platform.claude.com/playground', host: 'platform.claude.com/playground' },
    ],
  },
]
