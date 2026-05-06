import { defineDocumentType, makeSource } from 'contentlayer2/source-files'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  // 최상위 mdx만 Post로 인식. react-mastery/* 는 별도 타입으로 처리.
  filePathPattern: `*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', description: '포스트 제목', required: true },
    description: { type: 'string', description: '포스트 설명', required: false },
    date: { type: 'date', description: '작성 날짜', required: true },
    tags: {
      type: 'list',
      of: { type: 'string' },
      description: '태그 목록',
      required: false,
    },
    series: { type: 'string', description: '시리즈 이름', required: false },
    seriesOrder: { type: 'number', description: '시리즈 내 순서', required: false },
    draft: {
      type: 'boolean',
      description: '초안 여부 (true면 빌드에서 제외)',
      required: false,
      default: false,
    },
  },
  computedFields: {
    url: { type: 'string', resolve: (post) => `/posts/${post._raw.flattenedPath}` },
    slug: { type: 'string', resolve: (post) => post._raw.flattenedPath },
  },
}))

export const ReactMasteryTopic = defineDocumentType(() => ({
  name: 'ReactMasteryTopic',
  filePathPattern: `react-mastery/topics/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', description: '토픽 제목', required: true },
    slug: { type: 'string', description: 'topics.ts와 조인할 slug', required: true },
    readingTimeMin: {
      type: 'number',
      description: '예상 읽기 시간(분)',
      required: false,
    },
    description: { type: 'string', description: '한 줄 설명', required: false },
    tags: {
      type: 'list',
      of: { type: 'string' },
      description: '태그',
      required: false,
    },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/react-mastery/${doc.slug}`,
    },
  },
}))

export const ReactMasteryCard = defineDocumentType(() => ({
  name: 'ReactMasteryCard',
  filePathPattern: `react-mastery/cards/*.mdx`,
  contentType: 'mdx',
  fields: {
    id: { type: 'string', description: '고유 id', required: true },
    question: { type: 'string', description: '오늘의 질문', required: true },
    shortAnswer: { type: 'string', description: '한 줄 답', required: true },
    relatedTopic: {
      type: 'string',
      description: '연관 토픽 slug (선택)',
      required: false,
    },
  },
}))

export default makeSource({
  contentDirPath: './content',
  contentDirExclude: ['CLAUDE.md', 'AGENTS.md'],
  documentTypes: [Post, ReactMasteryTopic, ReactMasteryCard],
  mdx: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [rehypeHighlight, { ignoreMissing: true }],
    ],
  },
})
