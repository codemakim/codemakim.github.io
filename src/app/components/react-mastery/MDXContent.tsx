"use client";

import { useMDXComponent } from "next-contentlayer2/hooks";
import "katex/dist/katex.min.css";

interface Props {
  code: string;
}

export function MDXContent({ code }: Props) {
  const Component = useMDXComponent(code);
  return <Component />;
}
