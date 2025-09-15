// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
var Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "\uD3EC\uC2A4\uD2B8 \uC81C\uBAA9",
      required: true
    },
    description: {
      type: "string",
      description: "\uD3EC\uC2A4\uD2B8 \uC124\uBA85",
      required: false
    },
    date: {
      type: "date",
      description: "\uC791\uC131 \uB0A0\uC9DC",
      required: true
    },
    tags: {
      type: "list",
      of: { type: "string" },
      description: "\uD0DC\uADF8 \uBAA9\uB85D",
      required: false
    }
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (post) => `/posts/${post._raw.flattenedPath}`
    },
    slug: {
      type: "string",
      resolve: (post) => post._raw.flattenedPath
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "./content",
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeHighlight, { ignoreMissing: true }]
    ]
  }
});
export {
  Post,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-T2PUIAGZ.mjs.map
