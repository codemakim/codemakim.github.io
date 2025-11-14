"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type CodeOrderingQuizProps = {
  title?: string;
  description?: string;
  lines: string[];
};

type LineItem = {
  id: string;
  text: string;
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// 공백 정규화로 관대한 비교
const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

function SortableLine({ item }: { item: LineItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none",
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative
        p-2 md:p-2.5 rounded-xl
        bg-white/10 dark:bg-slate-800/40
        border border-white/20 dark:border-white/10
        backdrop-blur-md
        hover:bg-white/15 dark:hover:bg-slate-700/50
        active:scale-[0.98]
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-105 shadow-2xl z-50' : 'shadow-md'}
      `}
    >
      <div className="flex items-center gap-2">
        {/* 드래그 핸들 아이콘 - 투명하게 */}
        <div className="flex-shrink-0 text-gray-400/40 dark:text-gray-500/30 group-hover:text-gray-600/60 dark:group-hover:text-gray-400/50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        
        {/* 코드 텍스트 */}
        <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre">
          {item.text}
        </code>
      </div>
    </div>
  );
}

export default function CodeOrderingQuiz({
  title,
  description,
  lines,
}: CodeOrderingQuizProps) {
  // 정답 순서
  const correctOrder = useMemo<LineItem[]>(
    () =>
      lines.map((text, index) => ({
        id: `line-${index}-${text.slice(0, 10)}`,
        text,
      })),
    [lines]
  );

  // 최초 상태: 섞인 순서
  const [items, setItems] = useState<LineItem[]>(() =>
    shuffle(correctOrder)
  );
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px로 줄여서 더 민감하게 반응
        tolerance: 5, // 드래그 중 5px 오차 허용으로 떨림 방지
      },
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    setResult("idle");
  };

  const checkAnswer = () => {
    const isCorrect = items.every(
      (item, i) =>
        normalize(item.text) === normalize(correctOrder[i].text)
    );
    setResult(isCorrect ? "correct" : "wrong");
  };

  const reset = () => {
    setItems(shuffle(correctOrder));
    setResult("idle");
  };

  return (
    <div className="glass-card p-6 my-8 space-y-4">
      {/* 헤더 */}
      {title && (
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>
      )}

      {/* 드래그 영역 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((item) => (
              <SortableLine key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 버튼 & 피드백 */}
      <div className="flex flex-wrap items-center gap-3 pt-4">
        <button
          onClick={checkAnswer}
          className="btn btn-primary px-6 py-2.5 text-sm font-medium"
        >
          ✓ 정답 확인
        </button>
        
        <button
          onClick={reset}
          className="chip px-5 py-2.5 text-sm font-medium hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
        >
          🔄 다시 섞기
        </button>

        {/* 결과 메시지 */}
        {result === "correct" && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
            <span className="text-2xl">✅</span>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              정답입니다!
            </span>
          </div>
        )}
        {result === "wrong" && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700">
            <span className="text-2xl">❌</span>
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              조금만 더 고민해볼까요?
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
