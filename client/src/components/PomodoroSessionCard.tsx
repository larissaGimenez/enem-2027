import { useState } from "react";
import { Brain, Check, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import { Button } from "@/components/motion/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/motion/card";
import { DigitSwap } from "@/components/motion/digit-swap";
import { MATH_CURRICULUM } from "@/data/mathCurriculum";
import type { ScheduleDay } from "@/types/study";

export type PomodoroMode =
  | "focus-25"
  | "focus-50"
  | "explain-5"
  | "break-5"
  | "break-15";

export const POMODORO_PRESETS: Record<
  PomodoroMode,
  { label: string; minutes: number; isFocus: boolean }
> = {
  "focus-25": { label: "Foco 25m", minutes: 25, isFocus: true },
  "focus-50": { label: "Foco Longo 50m", minutes: 50, isFocus: true },
  "explain-5": { label: "Autoexplicação 5m", minutes: 5, isFocus: true },
  "break-5": { label: "Pausa 5m", minutes: 5, isFocus: false },
  "break-15": { label: "Pausa 15m", minutes: 15, isFocus: false },
};

interface PomodoroSessionCardProps {
  mode: PomodoroMode;
  secondsLeft: number;
  isRunning: boolean;
  selectedDayId: string;
  selectedTopicId: string;
  schedule: ScheduleDay[];
  completedSessions: number;
  onSelectMode: (mode: PomodoroMode) => void;
  onSelectDay: (dayId: string) => void;
  onSelectTopic: (topicId: string) => void;
  onToggleRun: () => void;
  onReset: () => void;
  onCompleteSession: () => void;
}

export function formatClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function PomodoroSessionCard({
  mode,
  secondsLeft,
  isRunning,
  selectedDayId,
  selectedTopicId,
  schedule,
  completedSessions,
  onSelectMode,
  onSelectDay,
  onSelectTopic,
  onToggleRun,
  onReset,
  onCompleteSession,
}: PomodoroSessionCardProps) {
  const preset = POMODORO_PRESETS[mode];
  const totalSeconds = preset.minutes * 60;
  const elapsedSeconds = Math.max(0, totalSeconds - secondsLeft);
  const progressPct = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progressPct / 100) * circumference;

  const activeDay = schedule.find((d) => d.id === selectedDayId) || schedule[0];
  const activeTopic = MATH_CURRICULUM.find((c) => c.id === selectedTopicId);
  const [brainDump, setBrainDump] = useState("");

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <Card className="bg-card shadow-sm lg:col-span-7">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Timer className="size-5 text-primary" />
              Sessão de Estudos (Pomodoro)
            </CardTitle>
            <CardDescription>
              Mantenha o timer ativo enquanto navega pelas questões ou conteúdos.
            </CardDescription>
          </div>
          <AnimatedBadge status={isRunning ? "success" : "info"}>
            {isRunning
              ? preset.isFocus
                ? "Em foco"
                : "Em pausa"
              : "Pronto"}
          </AnimatedBadge>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-2">
            {(Object.keys(POMODORO_PRESETS) as PomodoroMode[]).map((key) => {
              const item = POMODORO_PRESETS[key];
              const active = mode === key;
              return (
                <Button
                  key={key}
                  size="sm"
                  variant={active ? "primary" : "secondary"}
                  onClick={() => onSelectMode(key)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>

          <div className="relative flex size-52 items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="var(--muted)"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={preset.isFocus ? "var(--primary)" : "var(--success)"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="transition-[stroke-dashoffset] duration-500 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <DigitSwap
                value={formatClock(secondsLeft)}
                direction="down"
                className="font-[Plus_Jakarta_Sans] text-4xl font-extrabold tracking-tight text-foreground tabular-nums"
              />
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {preset.isFocus ? "Bloco de Foco" : "Descanso"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={onToggleRun}>
              {isRunning ? (
                <>
                  <Pause className="size-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Iniciar Sessão
                </>
              )}
            </Button>
            <Button variant="secondary" size="md" onClick={onReset}>
              <RotateCcw className="size-4" />
              Reiniciar
            </Button>
            {preset.isFocus && elapsedMinutes >= 1 && (
              <Button variant="outline" size="md" onClick={onCompleteSession}>
                <Check className="size-4 text-emerald-600" />
                Registrar +{elapsedMinutes} min
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm lg:col-span-5">
        <CardHeader>
          <CardTitle className="text-lg">Escolha o Tema da Sessão</CardTitle>
          <CardDescription>
            Selecione qual tema você vai estudar agora antes de iniciar o timer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="pomodoro-topic"
              className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
            >
              Tema de Estudo (Matemática)
            </label>
            <select
              id="pomodoro-topic"
              value={selectedTopicId}
              onChange={(e) => onSelectTopic(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
            >
              <option value="free">Estudo Livre / Revisão Geral</option>
              {MATH_CURRICULUM.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>

          {activeTopic && (
            <div className="rounded-2xl border border-indigo-200 bg-secondary/40 p-3.5 space-y-1">
              <span className="text-xs font-bold text-primary">
                {activeTopic.code} • {activeTopic.axis}
              </span>
              <p className="text-xs text-muted-foreground">
                {activeTopic.syllabus}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="pomodoro-day"
              className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
            >
              Dia da Grade Semanal
            </label>
            <select
              id="pomodoro-day"
              value={selectedDayId}
              onChange={(e) => onSelectDay(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
            >
              {schedule.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.day} — {d.subject}
                </option>
              ))}
            </select>
          </div>

          {activeDay && (
            <div className="rounded-2xl border border-border bg-muted/50 p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-foreground">
                  {activeDay.subject}
                </span>
                <AnimatedBadge status={activeDay.done ? "success" : "neutral"}>
                  Meta: {activeDay.minutes} min
                </AnimatedBadge>
              </div>
              <p className="text-xs text-muted-foreground">{activeDay.task}</p>
            </div>
          )}

          <div className="rounded-2xl border border-indigo-200 bg-secondary/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-secondary-foreground">
              Pomodoros concluídos
            </p>
            <p className="mt-1 font-[Plus_Jakarta_Sans] text-2xl font-extrabold text-primary">
              {completedSessions} sessões
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Cada bloco concluído soma automaticamente às suas horas estudadas
              no MySQL.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-border bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="brain-dump"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-foreground"
              >
                <Brain className="size-4 text-primary" />
                Folha em Branco (Active Recall)
              </label>
              {brainDump && (
                <button
                  type="button"
                  onClick={() => setBrainDump("")}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Limpar
                </button>
              )}
            </div>
            <textarea
              id="brain-dump"
              rows={4}
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
              placeholder="Sem olhar o material: despeje tudo o que você já lembra sobre este tema (ou use os 5 min de autoexplicação para testar onde travou)..."
              className="w-full rounded-xl border border-input bg-card p-2.5 text-xs leading-relaxed text-foreground"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
