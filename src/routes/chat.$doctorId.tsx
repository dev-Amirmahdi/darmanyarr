import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { doctorsRepo, chatsRepo } from "@/lib/repository";
import { Avatar } from "@/components/Avatar";
import { toFa } from "@/lib/persian";
import { ChevronRight, Send, Paperclip, Image as ImageIcon, Mic, PhoneCall, Video, CheckCheck } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat/$doctorId")({
  component: ChatPage,
  head: () => ({ meta: [{ title: "گفتگو با پزشک | مِدنِوبت" }] }),
});

const DOCTOR_REPLIES = [
  "سلام، بفرمایید در خدمتم.",
  "لطفاً علائم خود را دقیق‌تر توضیح دهید.",
  "این نکته را در نظر داشته باشید که تشخیص نهایی نیاز به معاینه دارد.",
  "چند وقت است این علائم را دارید؟",
  "پیشنهاد می‌کنم برای بررسی بیشتر نوبت حضوری هم رزرو کنید.",
];

function ChatPage() {
  const { doctorId } = Route.useParams();
  const router = useRouter();
  const doctor = doctorsRepo.byId(doctorId);
  if (!doctor) throw notFound();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMessages(chatsRepo.get(doctorId)); }, [doctorId]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages, typing]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    const msg: ChatMessage = { id: `m-${Date.now()}`, from: "me", text: t, at: new Date().toISOString(), read: false };
    chatsRepo.send(doctorId, msg);
    setMessages(chatsRepo.get(doctorId));
    setText("");
    setTyping(true);
    setTimeout(() => {
      const reply: ChatMessage = { id: `m-${Date.now() + 1}`, from: "doctor", text: DOCTOR_REPLIES[Math.floor(Math.random() * DOCTOR_REPLIES.length)], at: new Date().toISOString(), read: false };
      chatsRepo.send(doctorId, reply);
      setMessages(chatsRepo.get(doctorId));
      setTyping(false);
    }, 1200 + Math.random() * 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 glass border-b border-border">
        <div className="mx-auto max-w-3xl px-4 h-16 flex items-center gap-3">
          <button onClick={() => router.history.back()} className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><ChevronRight size={18} /></button>
          <Avatar seed={doctor.avatarSeed} size={40} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{doctor.name}</div>
            <div className="text-xs text-accent">{typing ? "در حال تایپ..." : doctor.isOnline ? "آنلاین" : "آفلاین"}</div>
          </div>
          <button className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><PhoneCall size={16} /></button>
          <button className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><Video size={16} /></button>
        </div>
      </header>

      <div ref={listRef} className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-3xl space-y-2">
          {messages.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              گفتگو را شروع کنید. پیام شما به {doctor.name} ارسال می‌شود.
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.from === "me" ? "justify-start" : "justify-end")}>
              <div className={cn("max-w-[75%] px-4 py-2.5 text-sm leading-6 shadow-card",
                m.from === "me"
                  ? "gradient-primary text-primary-foreground rounded-2xl rounded-bl-md"
                  : "bg-card text-card-foreground rounded-2xl rounded-br-md border border-border")}>
                {m.text}
                <div className={cn("mt-1 text-[10px] flex items-center gap-1 justify-end",
                  m.from === "me" ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {toFa(new Date(m.at).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }))}
                  {m.from === "me" && <CheckCheck size={12} />}
                </div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-end">
              <div className="bg-card border border-border rounded-2xl px-4 py-2.5 text-sm">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:.15s]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:.3s]" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 glass border-t border-border p-3">
        <div className="mx-auto max-w-3xl flex items-center gap-2 bg-input rounded-2xl px-2 py-1.5 border border-border">
          <button className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"><Paperclip size={16} /></button>
          <button className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"><ImageIcon size={16} /></button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 bg-transparent outline-none text-sm px-2"
          />
          <button className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center"><Mic size={16} /></button>
          <button onClick={send} className="h-9 w-9 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center shadow-card">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
