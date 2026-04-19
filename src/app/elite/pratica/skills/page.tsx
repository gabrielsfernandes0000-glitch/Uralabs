"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, Target, BookOpen, Check } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { GUIDED_TREINOS, type GuidedTreino } from "@/lib/pratica-treinos";

export default function PraticaSkillsPage() {
  const { completedLessons } = useProgress();
  const isCompleted = (lessonId: string) => completedLessons.includes(lessonId);

  const grouped = GUIDED_TREINOS.reduce<Record<string, GuidedTreino[]>>((acc, t) => {
    (acc[t.module] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="animate-in-up">
        <Link
          href="/elite/pratica"
          className="inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar pra Prática</span>
        </Link>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[28px] lg:text-[34px] font-bold text-white tracking-tight leading-[1.05]">
              Skills Guiadas
            </h1>
            <p className="text-[13px] text-white/45 mt-2 max-w-xl leading-relaxed">
              Sequências de 3 passos com gráfico real — identifique, decida e execute. Cada skill
              tá conectada a uma aula do currículo.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[30px] font-bold text-white leading-none font-mono">
              {GUIDED_TREINOS.length}
            </p>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] mt-1">skills</p>
          </div>
        </div>
      </div>

      <div className="animate-in-up delay-1 space-y-6">
        {Object.entries(grouped).map(([moduleName, treinos]) => {
          const moduleColor = treinos[0].moduleColor;
          return (
            <section key={moduleName} className="space-y-2.5">
              <div className="flex items-center gap-3 px-1">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: moduleColor + "80" }} />
                <h4 className="text-[11.5px] font-semibold text-white/55 uppercase tracking-wider">
                  {moduleName}
                </h4>
                <span className="text-[10px] text-white/25 font-mono">{treinos.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {treinos.map((treino) => {
                  const lessonDone = isCompleted(treino.requiredLesson);
                  return (
                    <Link
                      key={treino.id}
                      href={`/elite/treino/${treino.id}`}
                      className="interactive group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0e0e10] p-4 block hover:border-white/[0.16] cursor-pointer"
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{ background: `linear-gradient(90deg, transparent, ${moduleColor}40, transparent)` }}
                      />
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <Target className="w-5 h-5 shrink-0" style={{ color: moduleColor }} strokeWidth={1.5} />
                          <div className="min-w-0">
                            <h5 className="text-[13.5px] font-bold text-white/90 leading-tight truncate">
                              {treino.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-white/30">
                                {treino.difficulty.charAt(0).toUpperCase() + treino.difficulty.slice(1)}
                              </span>
                              <span className="text-[10px] text-white/20">·</span>
                              <span className="text-[10px] text-white/30 font-mono">
                                {treino.steps} passos
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/15 mt-1 shrink-0" />
                      </div>
                      <p className="text-[11.5px] leading-relaxed ml-8 text-white/40">{treino.desc}</p>
                      <div className="mt-2 ml-8 inline-flex items-center gap-1.5 text-[10px] text-white/35">
                        {lessonDone ? (
                          <>
                            <Check className="w-3 h-3 text-green-400/70" />
                            <span>Baseado em &ldquo;{treino.requiredLessonTitle}&rdquo;</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3 h-3 text-white/30" />
                            <span>Recomendado: ver &ldquo;{treino.requiredLessonTitle}&rdquo; antes</span>
                          </>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
