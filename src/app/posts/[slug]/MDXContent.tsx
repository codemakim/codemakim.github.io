"use client";

import { useMDXComponent } from "next-contentlayer2/hooks";
import "katex/dist/katex.min.css";

interface MDXContentProps {
  code: string;
}

export function MDXContent({ code }: MDXContentProps) {
  const Component = useMDXComponent(code);
  return <Component />;
}