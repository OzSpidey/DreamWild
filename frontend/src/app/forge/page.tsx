"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Feather } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { startGeneration } from "@/lib/api/stories";
import { useStoryStore } from "@/store/storyStore";
import { parseSSEStream } from "@/lib/api/sse";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Textarea, Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

const GENRES = ["fantasy","sci-fi","mystery","romance","horror","adventure","thriller","fairy-tale"];
const TONES  = ["whimsical","dark","epic","humorous","suspenseful","romantic"];
const AGES   = [
  { value: "children",     label: "Children",     note: "Ages 6-10" },
  { value: "middle-grade", label: "Middle Grade",  note: "Ages 9-12" },
  { value: "young-adult",  label: "Young Adult",   note: "Ages 13-18" },
  { value: "adult",        label: "Adult",         note: "18+" },
];
const STYLES = [
  { value: "illustrated",  label: "Illustrated",  note: "Storybook art" },
  { value: "realistic",    label: "Realistic",    note: "Photorealistic" },
  { value: "fantasy-art",  label: "Fantasy Art",  note: "Painterly" },
  { value: "noir",         label: "Noir",         note: "High contrast" },
  { value: "watercolor",   label: "Watercolor",   note: "Soft & dreamy" },
];

function SelectGrid<T extends string>({
  options, value, onChange, labelKey = "value",
}: {
  options: T[] | { value: T; label: string; note?: string }[];
  value: T; onChange: (v: T) => void;
  labelKey?: string;
}) {
  const items = options.map((o) => typeof o === "string" ? { value: o as T, label: o, note: undefined } : o);
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`px-4 py-2 rounded-sm border text-sm font-sans transition-all capitalize ${
            value === item.value
              ? "bg-gold-600/30 border-gold-600 text-gold-300"
              : "bg-ink-800 border-ink-600 text-parchment-400 hover:border-ink-500 hover:text-parchment-200"
          }`}
        >
          {item.label}
          {item.note && <span className="block text-xs opacity-60">{item.note}</span>}
        </button>
      ))}
    </div>
  );
}

const STEPS = ["Genre", "Tone", "Audience", "Characters", "Chapters & Style", "Review"];

export default function ForgePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const store = useStoryStore();

  const [step, setStep] = useState(0);
  const [genre, setGenre]         = useState("fantasy");
  const [tone, setTone]           = useState("epic");
  const [readingAge, setReadingAge] = useState("adult");
  const [protagonist, setProtagonist] = useState("");
  const [setting, setSetting]     = useState("");
  const [chapterCount, setChapterCount] = useState(5);
  const [imageStyle, setImageStyle] = useState("illustrated");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);

  const canNext = () => {
    if (step === 3) return protagonist.trim().length >= 2 && setting.trim().length >= 2;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    store.reset();
    try {
      const { storyId, stream } = await startGeneration({
        genre, tone, reading_age: readingAge, protagonist, setting, chapter_count: chapterCount, image_style: imageStyle,
      });
      store.setStoryId(storyId);

      // Read story_started to get the title before navigating
      let gotTitle = false;
      const cancel = parseSSEStream(stream, {
        story_started: (d) => {
          store.setStoryTitle(d.title as string);
          store.setStoryId(d.story_id as string);
          gotTitle = true;
        },
      }, () => {});

      // Give it 3s to get the title then navigate regardless
      await new Promise<void>((res) => {
        const check = setInterval(() => { if (gotTitle) { clearInterval(check); res(); } }, 100);
        setTimeout(() => { clearInterval(check); res(); }, 3000);
      });
      cancel();

      // Pass remaining stream via sessionStorage workaround — navigate to read page
      // The read page will re-connect to the story
      router.push(`/stories/${storyId}/read`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start generation");
      setSubmitting(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-ink-900 flex items-center justify-center"><Spinner size={36} /></div>;

  const stepContent = [
    <>
      <h2 className="font-serif text-xl text-parchment-100 mb-4">Choose your genre</h2>
      <SelectGrid options={GENRES} value={genre} onChange={setGenre} />
    </>,
    <>
      <h2 className="font-serif text-xl text-parchment-100 mb-4">Set the tone</h2>
      <SelectGrid options={TONES} value={tone} onChange={setTone} />
    </>,
    <>
      <h2 className="font-serif text-xl text-parchment-100 mb-4">Who is your audience?</h2>
      <SelectGrid options={AGES} value={readingAge} onChange={setReadingAge} />
    </>,
    <>
      <h2 className="font-serif text-xl text-parchment-100 mb-4">Set the stage</h2>
      <div className="flex flex-col gap-4">
        <Textarea id="protagonist" label="Protagonist" placeholder="A young sorceress named Elara, gifted but untrained, on the run from the Inquisition…" value={protagonist} onChange={(e) => setProtagonist(e.target.value)} rows={3} />
        <Textarea id="setting" label="Setting" placeholder="The crumbling empire of Valdris, where magic has been outlawed for 300 years…" value={setting} onChange={(e) => setSetting(e.target.value)} rows={3} />
      </div>
    </>,
    <>
      <h2 className="font-serif text-xl text-parchment-100 mb-6">Fine-tune your story</h2>
      <div className="flex flex-col gap-6">
        <div>
          <label className="text-xs font-sans uppercase tracking-widest text-parchment-400 block mb-3">
            Number of chapters — <span className="text-gold-400">{chapterCount}</span>
          </label>
          <input type="range" min={3} max={10} value={chapterCount} onChange={(e) => setChapterCount(Number(e.target.value))}
            className="w-full h-1.5 bg-ink-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-500"
          />
          <div className="flex justify-between text-xs text-parchment-400 font-sans mt-1"><span>3</span><span>10</span></div>
        </div>
        <div>
          <p className="text-xs font-sans uppercase tracking-widest text-parchment-400 mb-3">Image style</p>
          <SelectGrid options={STYLES} value={imageStyle} onChange={setImageStyle} />
        </div>
      </div>
    </>,
    <>
      <h2 className="font-serif text-xl text-parchment-100 mb-6">Review your story</h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-sans">
        {[
          ["Genre", genre], ["Tone", tone], ["Audience", readingAge],
          ["Chapters", chapterCount], ["Image style", imageStyle],
        ].map(([k, v]) => (
          <div key={String(k)}>
            <span className="text-parchment-400 uppercase tracking-widest text-xs">{k}</span>
            <p className="text-parchment-100 capitalize mt-0.5">{String(v)}</p>
          </div>
        ))}
        <div className="col-span-2">
          <span className="text-parchment-400 uppercase tracking-widest text-xs">Protagonist</span>
          <p className="text-parchment-100 mt-0.5 line-clamp-2">{protagonist}</p>
        </div>
        <div className="col-span-2">
          <span className="text-parchment-400 uppercase tracking-widest text-xs">Setting</span>
          <p className="text-parchment-100 mt-0.5 line-clamp-2">{setting}</p>
        </div>
      </div>
    </>,
  ];

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`h-1 w-full rounded-full transition-colors ${i <= step ? "bg-gold-500" : "bg-ink-700"}`} />
            </div>
          ))}
        </div>
        <p className="text-xs font-sans uppercase tracking-widest text-parchment-400 mb-2">
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </p>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="min-h-[240px]"
          >
            {stepContent[step]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)} disabled={step === 0} size="sm">
            <ChevronLeft size={15} /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} size="sm">
              Next <ChevronRight size={15} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting} size="md">
              <Feather size={15} />
              {submitting ? "Starting…" : "Forge my story"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
