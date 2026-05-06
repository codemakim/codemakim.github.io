"use client";

import { useEffect, useState } from "react";

export const REACT_MASTERY_READS_STORAGE_KEY = "blog.reactMasteryReads.v1";
export const REACT_MASTERY_READS_CHANGED_EVENT = "blog:reactMasteryReadsChanged";

interface ReadStateV1 {
  v: 1;
  read: Record<string, 1>;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function emptyState(): ReadStateV1 {
  return { v: 1, read: {} };
}

function loadState(): ReadStateV1 {
  if (!isBrowser()) return emptyState();
  try {
    const raw = window.localStorage.getItem(REACT_MASTERY_READS_STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ReadStateV1>;
    if (parsed?.v !== 1 || typeof parsed.read !== "object" || parsed.read === null) {
      return emptyState();
    }
    const read: Record<string, 1> = {};
    for (const [k, v] of Object.entries(parsed.read)) {
      if (typeof k === "string" && v === 1) read[k] = 1;
    }
    return { v: 1, read };
  } catch {
    return emptyState();
  }
}

function saveState(state: ReadStateV1): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(REACT_MASTERY_READS_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(REACT_MASTERY_READS_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function isTopicRead(slug: string): boolean {
  if (!slug) return false;
  return loadState().read[slug] === 1;
}

export function toggleTopicRead(slug: string): boolean {
  if (!slug) return false;
  const state = loadState();
  const next: ReadStateV1 = { v: 1, read: { ...state.read } };
  if (next.read[slug] === 1) {
    delete next.read[slug];
    saveState(next);
    return false;
  }
  next.read[slug] = 1;
  saveState(next);
  return true;
}

function subscribe(onChange: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handleCustom = () => onChange();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === REACT_MASTERY_READS_STORAGE_KEY) onChange();
  };
  window.addEventListener(REACT_MASTERY_READS_CHANGED_EVENT, handleCustom);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(REACT_MASTERY_READS_CHANGED_EVENT, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}

/**
 * 단일 토픽의 읽음 상태를 구독하는 hook.
 * SSR-safe: 첫 렌더는 false 반환, mount 후 실제 상태로 교체.
 */
export function useTopicRead(slug: string): boolean {
  const [read, setRead] = useState(false);
  useEffect(() => {
    setRead(isTopicRead(slug));
    return subscribe(() => setRead(isTopicRead(slug)));
  }, [slug]);
  return read;
}

/**
 * 전체 토픽 중 읽은 갯수를 구독하는 hook.
 * @param allSlugs 전체 토픽 slug 배열 (mdx로 작성된 것만)
 */
export function useReadCount(allSlugs: string[]): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const recompute = () => {
      const state = loadState();
      let n = 0;
      for (const s of allSlugs) {
        if (state.read[s] === 1) n++;
      }
      setCount(n);
    };
    recompute();
    return subscribe(recompute);
  }, [allSlugs]);
  return count;
}
