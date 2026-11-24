import { useState } from 'react'
import { getType } from '../logic'
import { Icon } from './ui'

// Entscheidungsbaum: erste zutreffende Frage bestimmt den Typ
const QUESTIONS: { q: string; detail: string; type: string }[] = [
  { q: 'Besteht das Unternehmen bereits länger als ca. 2–3 Jahre – oder geht es um Nachfolge bzw. Umbau?', detail: 'Wachstum, Innovationsprojekte, Export, Nachfolge, Transformation', type: 'kmu' },
  { q: 'Entsteht das Vorhaben an der HSLU oder in einer Forschungseinrichtung?', detail: 'Studierende, Alumni, Mitarbeitende, Forschende', type: 'spinoff' },
  { q: 'Beruht das Geschäftsmodell auf eigener Technologie, F&E oder Schutzrechten?', detail: 'z. B. Patente, Hardware, Software mit F&E-Kern, MedTech, CleanTech', type: 'tech' },
  { q: 'Ist das Modell skalierbar und kommt Beteiligungskapital (Angels, Crowd) infrage?', detail: 'Konsumgüter, Plattform, Service mit überregionalem Wachstum', type: 'startup' },
]

export function TypeFinder({ onPick, onClose }: { onPick: (t: string) => void; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const result = step >= QUESTIONS.length ? 'existenz' : null
  const t = result ? getType(result) : null

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Typ-Finder {!t && `· Frage ${step + 1} von ${QUESTIONS.length}`}</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">Welcher Gründertyp passt?</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100" aria-label="Schliessen"><Icon name="close" /></button>
        </div>
        {!t ? (
          <div className="mt-5">
            <p className="text-base font-medium leading-snug text-slate-800">{QUESTIONS[step].q}</p>
            <p className="mt-1 text-sm text-slate-500">{QUESTIONS[step].detail}</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => { onPick(QUESTIONS[step].type); onClose() }} className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-ink">
                Ja → {getType(QUESTIONS[step].type)!.short}
              </button>
              <button onClick={() => setStep(step + 1)} className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Nein</button>
            </div>
            {step > 0 && <button onClick={() => setStep(step - 1)} className="mt-3 text-xs text-slate-500 hover:underline">← zurück</button>}
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-sm text-slate-600">Keine der Fragen trifft zu – empfohlen:</p>
            <p className="mt-1 text-base font-semibold text-ink">{t.label}</p>
            <p className="mt-1 text-sm text-slate-500">{t.description}</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => { onPick(t.id); onClose() }} className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-ink">Übernehmen</button>
              <button onClick={() => setStep(0)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Neu starten</button>
            </div>
          </div>
        )}
        <p className="mt-5 border-t border-slate-100 pt-3 text-[11px] leading-snug text-slate-400">
          Zusatzmerkmale wie Gründerinnen, CleanTech oder Gründung aus Arbeitslosigkeit werden unabhängig vom Typ über die Zielgruppen-Filter ergänzt.
        </p>
      </div>
    </div>
  )
}
