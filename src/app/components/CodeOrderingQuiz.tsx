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
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative w-full
        p-4 md:p-5 rounded-xl
        bg-gray-50 dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        hover:bg-gray-100 dark:hover:bg-gray-700
        active:scale-[0.98]
        transition-all duration-200
        select-none
        ${isDragging ? 'opacity-50 scale-105 shadow-2xl z-50' : 'shadow-md'}
      `}
    >
      {/* 코드 텍스트 - 전체 영역 드래그 가능, 텍스트 선택 불가 */}
      <code className="block w-full text-sm md:text-base font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all select-none pointer-events-none">
        {item.text}
      </code>
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
        distance: 1, // 1px만 이동해도 드래그 시작
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
    <div className="card p-6 my-8 space-y-4">
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
          <div className="space-y-1.5">
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
          className="btn-primary px-6 py-2.5 text-sm font-medium"
        >
          ✓ 정답 확인
        </button>
        
        <button
          onClick={reset}
          className="tag px-5 py-2.5 text-sm font-medium"
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
