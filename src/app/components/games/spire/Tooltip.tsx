'use client';

import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const GAP = 6;

interface Props {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * 위치 자동 조정 툴팁.
 * - useLayoutEffect로 실제 렌더된 크기를 측정해 정확히 위치시킨다 (추정값 불필요).
 * - closest('main') 게임 컨테이너 영역 안에서만 표시된다.
 * - 게임 영역 상단에 가까우면 아래로, 아니면 위로 표시한다.
 * - position: fixed → overflow-hidden 부모에 관계없이 항상 표시된다.
 */
export default function Tooltip({ content, children, className = '' }: Props) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  // 툴팁이 DOM에 등장한 직후(visible=true), 실제 크기를 측정해 정확한 위치로 재조정한다.
  // useLayoutEffect: 브라우저 페인트 전에 동기 실행 → 깜빡임 없음
  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current || !triggerRef.current) return;

    const t = tooltipRef.current.getBoundingClientRect();  // 실제 툴팁 크기
    const r = triggerRef.current.getBoundingClientRect();  // 트리거 위치
    const gameEl = triggerRef.current.closest('main') ?? document.body;
    const g = gameEl.getBoundingClientRect();              // 게임 컨테이너 경계

    // 세로: 게임 영역 상단에서 t.height 이상 떨어져 있으면 위로, 아니면 아래로
    let top = r.top - g.top >= t.height + GAP
      ? r.top - t.height - GAP
      : r.bottom + GAP;
    top = Math.max(g.top + GAP, Math.min(top, g.bottom - t.height - GAP));

    // 가로: 트리거 중앙 기준, 실제 너비로 게임 영역 안에 클램프
    let left = r.left + r.width / 2 - t.width / 2;
    left = Math.max(g.left + GAP, Math.min(left, g.right - t.width - GAP));

    setCoords({ top, left });
  }, [visible]);

  const show = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    // 초기값: 트리거 바로 아래 (useLayoutEffect에서 정확히 재조정됨)
    setCoords({ top: r.bottom + GAP, left: r.left });
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  const toggle = useCallback(() => {
    if (visible) hide(); else show();
  }, [visible, show, hide]);

  return (
    <span
      ref={triggerRef}
      className={`inline-block ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onClick={toggle}
    >
      {children}

      {visible && typeof document !== 'undefined' && createPortal(
        <span
          ref={tooltipRef}
          className="pointer-events-none
            bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl
            px-2.5 py-1.5 text-left whitespace-nowrap"
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
            maxWidth: '220px',
            whiteSpace: 'normal',
          }}
        >
          {content}
        </span>,
        document.body
      )}
    </span>
  );
}
