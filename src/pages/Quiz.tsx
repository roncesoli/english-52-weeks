import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Headphones, RefreshCw, Trophy, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bi } from '../components/Bi';
import { Page, PageHeader } from '../components/Page';
import { ProgressRing } from '../components/ProgressRing';
import { SpeakButton } from '../components/SpeakButton';
import { allPhrases, allWords, getWeek, weeks } from '../data/course';
import { celebrate } from '../lib/confetti';
import { quarterColor, shuffle } from '../lib/theme';
import { speak } from '../lib/tts';
import { useProgress } from '../store/useProgress';
import { useStats } from '../store/useStats';
import type { Week } from '../types';

type QType = 'en-pt' | 'pt-en' | 'listen' | 'phrase-en-pt' | 'phrase-pt-en';

interface Question {
  type: QType;
  /** Text shown (or spoken for "listen"). */
  prompt: string;
  options: string[];
  answer: string;
}

const QUESTION_COUNT = 5;
const PASS = 80;

const TYPE_LABEL: Record<QType, { pt: string; en: string }> = {
  'en-pt': { pt: 'O que significa?', en: 'What does it mean?' },
  'pt-en': { pt: 'Como se diz em inglês?', en: 'How do you say it in English?' },
  listen: { pt: 'Ouça e escolha', en: 'Listen and choose' },
  'phrase-en-pt': { pt: 'Traduza a frase', en: 'Translate the sentence' },
  'phrase-pt-en': { pt: 'Escolha a frase em inglês', en: 'Choose the English sentence' },
};

/** Picks `n` unique distractors from `pool`, excluding `answer`. Closer items (same week/quarter) first. */
function distractors(answer: string, pools: string[][], n = 3): string[] {
  const out: string[] = [];
  for (const pool of pools) {
    for (const v of shuffle(pool)) {
      if (out.length >= n) return out;
      if (v.toLowerCase() !== answer.toLowerCase() && !out.some((o) => o.toLowerCase() === v.toLowerCase())) out.push(v);
    }
  }
  return out;
}

/** Generates 5 questions from the week's words and phrases. */
function generateQuiz(week: Week): Question[] {
  const sameQuarterWords = allWords.filter((w) => w.quarter === week.quarter);
  const sameQuarterPhrases = allPhrases.filter((p) => getWeek(p.week)?.quarter === week.quarter);
  const words = shuffle(week.words);
  const phrases = shuffle(week.phrases);
  // Word-based question types first, then phrase-based; repeat items if the week is small.
  const plan: QType[] = shuffle(['en-pt', 'pt-en', 'listen'] as QType[]).concat(shuffle(['phrase-en-pt', 'phrase-pt-en'] as QType[]));

  const questions = plan.slice(0, QUESTION_COUNT).map((type, i): Question => {
    if (type.startsWith('phrase')) {
      const p = phrases[i % phrases.length] ?? week.phrases[0];
      const toPt = type === 'phrase-en-pt';
      const answer = toPt ? p.pt : p.en;
      const pick = (x: { en: string; pt: string }) => (toPt ? x.pt : x.en);
      const opts = distractors(answer, [
        week.phrases.map(pick),
        sameQuarterPhrases.map(pick),
        allPhrases.map(pick),
      ]);
      return { type, prompt: toPt ? p.en : p.pt, answer, options: shuffle([answer, ...opts]) };
    }
    const w = words[i % words.length];
    const toPt = type === 'en-pt';
    const answer = toPt ? w.pt : w.en;
    const pick = (x: { en: string; pt: string }) => (toPt ? x.pt : x.en);
    const opts = distractors(answer, [week.words.map(pick), sameQuarterWords.map(pick), allWords.map(pick)]);
    return { type, prompt: type === 'pt-en' ? w.pt : w.en, answer, options: shuffle([answer, ...opts]) };
  });
  return shuffle(questions);
}

export default function Quiz() {
  const { week: param } = useParams();
  const navigate = useNavigate();
  const { currentWeek } = useStats();
  const weekNum = Number(param) || currentWeek;
  const week = getWeek(weekNum) ?? getWeek(1)!;
  const color = quarterColor(week.quarter);
  const recordQuiz = useProgress((s) => s.recordQuiz);
  const prev = useProgress((s) => s.quizzes[week.week]);

  const [seed, setSeed] = useState(0);
  // `seed` forces a new random quiz on "Try again".
  const questions = useMemo(() => generateQuiz(week), [week, seed]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  // Reset when week or seed changes.
  useEffect(() => {
    setIndex(0);
    setChosen(null);
    setCorrect(0);
    setFinished(false);
  }, [week, seed]);

  const q = questions[index];

  // Auto-play audio for "listen" questions.
  useEffect(() => {
    if (q?.type === 'listen' && !finished) {
      const id = setTimeout(() => speak(q.prompt), 300);
      return () => clearTimeout(id);
    }
  }, [q, finished]);

  const choose = (opt: string) => {
    if (chosen) return;
    setChosen(opt);
    if (opt === q.answer) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setChosen(null);
    } else {
      const score = Math.round((correct / questions.length) * 100);
      recordQuiz(week.week, score);
      setFinished(true);
      if (score >= PASS) celebrate();
    }
  };

  const score = Math.round((correct / questions.length) * 100);

  return (
    <Page>
      <PageHeader
        pt={`Quiz · Semana ${week.week}`}
        en={`Quiz · Week ${week.week}`}
        right={
          <select
            aria-label="Escolher semana / Choose week"
            value={week.week}
            onChange={(e) => navigate(`/quiz/${e.target.value}`)}
            className="input w-auto min-h-touch"
          >
            {weeks.map((w) => (
              <option key={w.week} value={w.week}>
                Semana {w.week}
              </option>
            ))}
          </select>
        }
      />

      {prev && (
        <p className="mb-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          {prev.passed && <Trophy className="h-4 w-4 text-accent-yellow" aria-hidden />}
          Melhor nota / Best score: <strong>{prev.best}%</strong> · Tentativas / Attempts: {prev.attempts}
        </p>
      )}

      {finished ? (
        <motion.section initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card mx-auto flex max-w-lg flex-col items-center gap-4 p-8 text-center">
          <ProgressRing value={score} size={160} stroke={16} color={score >= PASS ? '#2E8B57' : '#E4572E'} />
          {score >= PASS ? (
            <>
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-yellow text-navy shadow-lift"
              >
                <Trophy className="h-8 w-8" aria-hidden />
              </motion.span>
              <Bi pt={score === 100 ? 'Quiz perfeito!' : 'Aprovado!'} en={score === 100 ? 'Perfect quiz!' : 'Passed!'} className="text-2xl font-extrabold" />
            </>
          ) : (
            <Bi pt={`Quase! Você precisa de ${PASS}%.`} en={`Almost! You need ${PASS}%.`} className="text-2xl font-extrabold" />
          )}
          <p className="text-slate-500 dark:text-slate-400">
            {correct} / {questions.length} corretas / correct
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setSeed((s) => s + 1)} className="btn-primary" style={{ backgroundColor: color }}>
              <RefreshCw className="h-5 w-5" aria-hidden /> <Bi pt="Tentar de novo" en="Try again" />
            </button>
            <Link to={`/week/${week.week}`} className="btn bg-surface dark:bg-navy">
              <Bi pt="Voltar à semana" en="Back to week" />
            </Link>
          </div>
        </motion.section>
      ) : (
        q && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-navy-light">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} animate={{ width: `${(index / questions.length) * 100}%` }} />
              </div>
              <span className="text-sm font-bold">
                {index + 1}/{questions.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.section
                key={`${seed}-${index}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="card p-5"
                aria-live="polite"
              >
                <Bi pt={TYPE_LABEL[q.type].pt} en={TYPE_LABEL[q.type].en} className="mb-4 text-sm font-bold text-slate-500 dark:text-slate-400" />
                {q.type === 'listen' ? (
                  <div className="mb-5 flex flex-col items-center gap-2">
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Headphones className="h-5 w-5" aria-hidden /> Toque para ouvir / Tap to listen
                    </span>
                    <SpeakButton text={q.prompt} color={color} size="lg" />
                  </div>
                ) : (
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <p lang={q.type === 'en-pt' || q.type === 'phrase-en-pt' ? 'en' : 'pt'} className="text-3xl font-extrabold" style={{ color }}>
                      {q.prompt}
                    </p>
                    {(q.type === 'en-pt' || q.type === 'phrase-en-pt') && <SpeakButton text={q.prompt} color={color} />}
                  </div>
                )}

                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, i) => {
                    const isAnswer = opt === q.answer;
                    const isChosen = opt === chosen;
                    let cls = 'bg-surface hover:bg-slate-200 dark:bg-navy dark:hover:bg-navy-dark';
                    if (chosen && isAnswer) cls = 'bg-q4 text-white';
                    else if (chosen && isChosen) cls = 'bg-accent-red text-white';
                    else if (chosen) cls = 'bg-surface opacity-50 dark:bg-navy';
                    return (
                      <motion.button
                        key={opt}
                        whileTap={{ scale: 0.97 }}
                        animate={chosen && isChosen && !isAnswer ? { x: [0, -8, 8, -4, 4, 0] } : {}}
                        onClick={() => choose(opt)}
                        disabled={!!chosen}
                        className={`flex min-h-[56px] items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-bold transition ${cls}`}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/10 text-xs dark:bg-white/10">
                          {chosen && isAnswer ? <Check className="h-4 w-4" aria-hidden /> : chosen && isChosen ? <X className="h-4 w-4" aria-hidden /> : String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>

                {chosen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className={`font-extrabold ${chosen === q.answer ? 'text-q4' : 'text-accent-red'}`}>
                      {chosen === q.answer ? 'Correto! / Correct!' : `Resposta / Answer: ${q.answer}`}
                    </span>
                    <button onClick={next} className="btn-primary" style={{ backgroundColor: color }} autoFocus>
                      <Bi pt={index + 1 < questions.length ? 'Próxima' : 'Ver resultado'} en={index + 1 < questions.length ? 'Next' : 'See result'} />
                      <ArrowRight className="h-5 w-5" aria-hidden />
                    </button>
                  </motion.div>
                )}
              </motion.section>
            </AnimatePresence>
          </div>
        )
      )}
    </Page>
  );
}
