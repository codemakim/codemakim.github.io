import { defineDocumentType, makeSource } from 'contentlayer2/source-files'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

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
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeHighlight, { ignoreMissing: true }],
    ],
  },
})