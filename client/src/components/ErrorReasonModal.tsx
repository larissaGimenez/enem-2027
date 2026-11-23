import { useState } from "react";
import {
  BookOpen,
  Calculator,
  Clock,
  EyeOff,
  HelpCircle,
  ScanSearch,
  X,
} from "lucide-react";
import { Button } from "@/components/motion/button";
import type { ErrorReason } from "@/types/study";

export const ERROR_REASONS: Array<{
  id: ErrorReason;
  icon: typeof BookOpen;
}> = [
  { id: "Não sabia o conteúdo", icon: BookOpen },
  { id: "Interpretei errado", icon: ScanSearch },
  { id: "Errei a conta", icon: Calculator },
  { id: "Falta de atenção", icon: EyeOff },
  { id: "Faltou tempo", icon: Clock },
  { id: "Chutei", icon: HelpCircle },
];

interface ErrorReasonModalProps {
  open: boolean;
  area: string;
  topic: string;
  initialReason?: ErrorReason;
  onClose: () => void;
  onSave: (reason: ErrorReason, note: string) => void;
}

export function ErrorReasonModal({
  open,
  area,
  topic,
  initialReason = "Não sabia o conteúdo",
  onClose,
  onSave,
}: ErrorReasonModalProps) {
  const [reason, setReason] = useState<ErrorReason>(initialReason);
  const [note, setNote] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
    >
      <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="error-modal-title"
              className="font-display text-lg font-extrabold text-foreground"
            >
              Guardar no caderno de erros
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Anote o porquê do erro: na revisão, é isso que faz você não errar de novo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-xs">
          <span className="font-bold text-foreground">{area}</span>
          <span className="text-muted-foreground"> • {topic}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ERROR_REASONS.map((item) => {
            const Icon = item.icon;
            const active = reason === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setReason(item.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                    : "border-border bg-white text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="leading-tight">{item.id}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            Observação (opcional)
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: confundi juros simples com compostos; reler a fórmula do montante."
            className="w-full rounded-2xl border border-border bg-muted/20 p-3 text-xs text-foreground focus:bg-white"
          />
        </div>

        <div className="mt-5">
          <Button
            className="w-full rounded-full"
            onClick={() => {
              onSave(reason, note.trim());
              setNote("");
              onClose();
            }}
          >
            Guardar questão
          </Button>
        </div>
      </div>
    </div>
  );
}
