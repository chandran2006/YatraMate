import { useState, useRef, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, History, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
}

const suggestions = [
  "Best time to visit Japan?",
  "Budget trip ideas for Europe",
  "Top beaches in Southeast Asia",
  "Family-friendly destinations",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatbotPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI travel assistant. Ask me anything about travel planning, destinations, budgets, or tips! 🌍" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat sessions for logged-in user
  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    setLoadingSessions(true);
    const { data } = await supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) {
      setSessions(data.map((s: any) => ({
        id: s.id,
        title: s.title,
        messages: (s.messages as Message[]) || [],
        created_at: s.created_at,
      })));
    }
    setLoadingSessions(false);
  };

  const saveSession = async (msgs: Message[], sessionId: string | null) => {
    if (!user) return sessionId;
    const title = msgs.find(m => m.role === "user")?.content.slice(0, 50) || "New Chat";

    if (sessionId) {
      await supabase.from("chat_history").update({
        messages: msgs as any,
        title,
        updated_at: new Date().toISOString(),
      }).eq("id", sessionId);
      return sessionId;
    } else {
      const { data } = await supabase.from("chat_history").insert({
        user_id: user.id,
        messages: msgs as any,
        title,
      }).select("id").single();
      if (data) {
        setActiveSessionId(data.id);
        return data.id;
      }
      return null;
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([{ role: "assistant", content: "Hello! I'm your AI travel assistant. Ask me anything about travel planning, destinations, budgets, or tips! 🌍" }]);
    setShowHistory(false);
  };

  const loadSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setShowHistory(false);
  };

  const deleteSession = async (id: string) => {
    await supabase.from("chat_history").delete().eq("id", id);
    if (activeSessionId === id) startNewChat();
    loadSessions();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    let currentSessionId = activeSessionId;

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length === allMessages.length + 1) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save to DB after complete
      const finalMessages = [...allMessages, { role: "assistant" as const, content: assistantSoFar }];
      currentSessionId = await saveSession(finalMessages, currentSessionId) ?? null;
      loadSessions();
    } catch (e) {
      console.error("Chat error:", e);
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed to get response", variant: "destructive" });
      if (!assistantSoFar) setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Sidebar - Chat History */}
        {user && (
          <div className={`${showHistory ? "flex" : "hidden"} md:flex flex-col w-64 border-r border-border bg-card shrink-0`}>
            <div className="p-3 border-b border-border">
              <Button onClick={startNewChat} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                <Plus className="w-4 h-4" /> New Chat
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingSessions && <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>}
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm group ${
                    activeSessionId === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => loadSession(s)}
                >
                  <span className="flex-1 truncate">{s.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {!loadingSessions && sessions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No chat history yet</p>
              )}
            </div>
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center gap-2">
            {user && (
              <button onClick={() => setShowHistory(!showHistory)} className="md:hidden p-2 rounded-lg hover:bg-muted">
                <History className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <h1 className="font-display text-2xl font-bold text-foreground">AI Travel Assistant</h1>
          </div>

          <div className="flex-1 overflow-y-auto px-4 lg:px-8">
            <div className="container mx-auto max-w-3xl space-y-4 pb-4">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-accent-foreground" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card text-card-foreground shadow-card rounded-bl-md"}`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                    ) : msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && !messages[messages.length - 1]?.content && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-accent-foreground" /></div>
                  <div className="bg-card rounded-2xl rounded-bl-md px-4 py-3 shadow-card">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {messages.length <= 1 && (
            <div className="container mx-auto max-w-3xl px-4 lg:px-8 pb-2">
              <div className="flex gap-2 flex-wrap">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} className="px-4 py-2 bg-card border border-border rounded-full text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary" />{s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border bg-background py-4 px-4 lg:px-8">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="container mx-auto max-w-3xl flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything about travel..." className="flex-1 bg-card border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground font-body" />
              <Button type="submit" disabled={!input.trim() || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4"><Send className="w-4 h-4" /></Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatbotPage;
