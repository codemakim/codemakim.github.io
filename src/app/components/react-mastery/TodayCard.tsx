import Link from "next/link";
import { getTodayCard } from "@/app/lib/reactMastery/getCards";
import { MDXContent } from "@/app/components/react-mastery/MDXContent";

export default function TodayCard() {
  const card = getTodayCard();

  if (!card) {
    return (
      <div className="card-content p-6">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          오늘의 한 컷이 아직 준비되지 않았어요.
        </p>
      </div>
    );
  }

  return (
    <article
      className="card-content p-6"
      style={{
        background: "var(--accent)",
        color: "var(--accent-text)",
        border: "var(--nb-border)",
      }}
    >
      <div className="text-xs font-bold mb-2" style={{ opacity: 0.85 }}>
        오늘의 한 컷
      </div>
      <h2 className="text-xl font-black mb-3">{card.question}</h2>

      <div className="text-sm font-bold mb-1" style={{ opacity: 0.85 }}>
        짧은 답
      </div>
      <p className="mb-4">{card.shortAnswer}</p>

      <div className="text-sm font-bold mb-1" style={{ opacity: 0.85 }}>
        깊은 답
      </div>
      <div
        className="prose prose-invert"
        style={{ color: "var(--accent-text)" }}
      >
        <MDXContent code={card.body.code} />
      </div>

      {card.relatedTopic && (
        <div className="mt-4">
          <Link
            href={`/react-mastery/${card.relatedTopic}`}
            className="text-sm font-bold underline"
            style={{ color: "var(--accent-text)" }}
          >
            관련 토픽 보기 →
          </Link>
        </div>
      )}
    </article>
  );
}
