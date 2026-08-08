import { describe, expect, it } from 'vitest'
import { normalizeTable } from '../src/table.ts'
import { toc, slugify, extractHeadings } from '../src/toc.ts'

describe('normalizeTable: HTML 输入', () => {
  it('converts an HTML table', () => {
    expect(normalizeTable('<table><tr><th>a</th><th>b</th></tr><tr><td>1</td><td>2</td></tr></table>'))
      .toBe('| a | b |\n| --- | --- |\n| 1 | 2 |\n')
  })

  it('errors when no <table> element is present in HTML input', () => {
    expect(() => normalizeTable('<p>no table</p>')).toThrow('markdown: table: no <table> element found')
  })
})

describe('normalizeTable: 管道分隔文本', () => {
  it('treats the first row as the header', () => {
    expect(normalizeTable('name, city\nalice, nyc\nbob, la'))
      .toBe('| name, city |\n| --- |\n| alice, nyc |\n| bob, la |\n')
  })

  it('keeps an existing separator row structure', () => {
    expect(normalizeTable('| a | b |\n| --- | --- |\n| 1 | 2 |'))
      .toBe('| a | b |\n| --- | --- |\n| 1 | 2 |\n')
  })

  it('pads inconsistent column counts', () => {
    expect(normalizeTable('a|b|c\n1|2'))
      .toBe('| a | b | c |\n| --- | --- | --- |\n| 1 | 2 |  |\n')
  })

  it('supports \\| escapes inside cells', () => {
    expect(normalizeTable('a\\|b|c\n1|2'))
      .toBe('| a\\|b | c |\n| --- | --- |\n| 1 | 2 |\n')
  })

  it('rejects empty input and unsupported formats', () => {
    expect(() => normalizeTable('   ')).toThrow('markdown: table: empty input')
    expect(() => normalizeTable('a|b', { format: 'md' })).toThrow('markdown: table: unsupported format "md"')
  })
})

describe('toc: 目录生成', () => {
  it('generates a nested TOC with anchors', () => {
    const md = '# 标题一\n\n## 小节 A\n\n### 小小节\n\n## 小节 B'
    expect(toc(md)).toBe(
      '- [标题一](#标题一)\n  - [小节 A](#小节-a)\n    - [小小节](#小小节)\n  - [小节 B](#小节-b)',
    )
  })

  it('slugifies GitHub-style (lowercase, punctuation removed)', () => {
    expect(slugify('Hello, World!')).toBe('hello-world')
    expect(slugify('Foo_Bar Baz')).toBe('foo-bar-baz')
    expect(slugify('中文标题 OK')).toBe('中文标题-ok')
  })

  it('returns empty string when no headings exist', () => {
    expect(toc('plain text')).toBe('')
    expect(extractHeadings('#   ')).toEqual([])
  })
})
