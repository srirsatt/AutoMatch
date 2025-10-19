"use client";
import { useState } from "react";
import Button from "./Button";

export default function ChatBox() {
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I can help you negotiate your plan." },
  ]);
  const [input, setInput] = useState("");

  return (
    <div className="mt-4 border rounded">
      <div className="p-3 h-48 overflow-auto space-y-2 bg-gray-50">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "ai" ? "text-sm" : "text-sm text-right"}>
            <span className={m.role === "ai" ? "bg-white border px-2 py-1 rounded" : "bg-black text-white px-2 py-1 rounded inline-block"}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <div className="p-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
          placeholder="Ask about APR, down payment, rebates..."
        />
        <Button
          onClick={() => {
            if (!input.trim()) return;
            setMsgs((m) => [...m, { role: "user", text: input }]);
            setTimeout(() => {
              setMsgs((m) => [...m, { role: "ai", text: "Try extending the term or asking for a loyalty rebate." }]);
            }, 250);
            setInput("");
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
