/**
 * Markdown 目录生成 —— 从标题行生成嵌套列表 + 锚点链接。零依赖，纯函数。
 *
 * 锚点 slugify（GitHub 风格简化版）：小写、去除标点、空白转 '-'
 * （CJK 字符保留——GitHub 锚点对 CJK 原样保留）。
 */

/** GitHub 风格锚点（简化）：小写 + 去标点 + 空白转 '-'。 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .trim()
    .replace(/[ _]+/g, '-')
}

export interface TocEntry {
  level: number
  text: string
  anchor: string
}

/** 从 Markdown 提取标题序列。 */
export function extractHeadings(markdown: string): TocEntry[] {
  const entries: TocEntry[] = []
  for (const line of markdown.replace(/\r\n/g, '\n').split('\n')) {
    const m = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line)
    if (m) {
      const text = m[2]!.trim()
      if (text === '') continue
      entries.push({ level: m[1]!.length, text, anchor: slugify(text) })
    }
  }
  return entries
}

/** 标题序列 → 嵌套目录列表（2 空格/层缩进）。无标题返回空字符串。 */
export function toc(markdown: string): string {
  const entries = extractHeadings(markdown)
  const lines: string[] = []
  for (const e of entries) {
    const indent = '  '.repeat(Math.max(0, e.level - 1))
    lines.push(`${indent}- [${e.text}](#${e.anchor})`)
  }
  return lines.join('\n')
}
