import { defineDocumentType, makeSource } from 'contentlayer2/source-files'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      description: '포스트 제목',
      required: true,
    },
    description: {
      type: 'string',
      description: '포스트 설명',
      required: false,
    },
    date: {
      type: 'date',
      description: '작성 날짜',
      required: true,
    },
    tags: {
      type: 'list',
      of: { type: 'string' },
      description: '태그 목록',
      required: false,
    },
    series: {
      type: 'string',
      description: '시리즈 이름',
      required: false,
    },
    seriesOrder: {
      type: 'number',
      description: '시리즈 내 순서',
      required: false,
    },
    draft: {
      type: 'boolean',
      description: '초안 여부 (true면 빌드에서 제외)',
      required: false,
      default: false,
    },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (post) => `/posts/${post._raw.flattenedPath}`,
    },
    slug: {
      type: 'string',
      resolve: (post) => post._raw.flattenedPath,
    },
  },
}))

export default makeSource({
  contentDirPath: './content',
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [rehypeHighlight, { ignoreMissing: true }],
    ],
  },
})