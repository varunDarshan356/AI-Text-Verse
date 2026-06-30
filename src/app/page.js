"use client";

import { useState } from 'react';

export default function Home() {

  const [mode, setMode] = useState("summarize");
  const [tone, setTone] = useState("simple");
  const [target, setTarget] = useState("tamil");

  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const [cooldown, setCooldown] = useState(false);
  const [copied, setCopied] = useState(false);

  const MODES = [
    {
      key: "summarize",
      label: "Summarize"
    },
    {
      key: "rewrite",
      label: "Rewrite"
    },
    {
      key: "translate",
      label: "Translate"
    }
  ];

  function loadSample() {
    setText("I built a small feature to speed up the app. It loads faster now and users should notice the difference. Few changes were made in the API and UI.");
  }

  function clear() {
    setText("");
    setOutput("");
  }

  async function onCopy() {
    if(!output) return;

    await navigator.clipboard.writeText(output);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  async function transform() {
    if(!text.trim()) return;
    
    if(cooldown) return;

    setCooldown(true);
    setLoading(true);
    setOutput("");

    try{

      /* 
      console.log({
      input: text,
      mode,
      tone,
      target
      });
      */

      const response = await fetch("/api/transform", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          input: text,
          mode,
          tone: mode === "rewrite" ? tone : undefined,
          target: mode === "translate" ? target: undefined,
        }),
      });

      const data = await response.json();
      //console.log(data);

      if(!response.ok) throw new Error("Request failed");

      setOutput(data.output);
    }
    catch(error) {
      console.error(error);
    }
    finally {
      setLoading(false);

      setTimeout(() => {
        setCooldown(false);
      }, 3000);   //3 seconds cooldown to prevent spamming the API
    }

  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            AI Text Verse
          </h1>
          <p className="mt-2 text-zinc-300">
            Summarize, rewrite, and translate
          </p>
        </header>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          {/* Mode buttons + actions */}
          <div className="flex flex-wrap items-center gap-2">
            
            {
              MODES.map((eachMode) => (
                <button 
                  key={eachMode.key}
                  value={eachMode.key}
                  onClick={(e) => setMode(eachMode.key)}
                  className={
                    [
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      mode === eachMode.key 
                        ? "bg-zinc-100 text-zinc-900"
                        : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    ].join(" ")}
                >
                  {eachMode.label}
                </button>
              ))
            }

            <div className="ml-auto flex items-center gap-2">
              <button onClick={loadSample} className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
                Load sample
              </button>
              <button onClick={clear} className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
                Clear
              </button>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Left: Input */}
            <div className="space-y-3">
              <label className="text-sm text-zinc-300">Input</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here…"
                className="h-64 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-100 outline-none focus:border-zinc-500"
              />

              {/* Tone dropdown (for Rewrite mode) */}
              {mode === "rewrite" && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-300">Tone</span>
                  <select 
                    onChange={(e) => setTone(e.target.value)}
                    value={tone}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100">
                    <option value="simple">Simple</option>
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>         
                    <option value="informal">Informal</option>    
                    <option value="humorous">Humorous</option>       
                    <option value="optimistic">Optimistic</option>  
                    <option value="empathetic">Empathetic</option>    
                    <option value="encouraging">Encouraging</option> 
                    <option value="inspirational">Inspirational</option>    
                    <option value="dramatic">Dramatic</option>     
                    <option value="funny">Funny</option>
                  </select>
                </div>
              )}

              {/* Target language (for Translate mode) */}
              {mode === "translate" && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-300">Target</span>
                  <select 
                    onChange={(e) => setTarget(e.target.value)}
                    value={target}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100">
                    <option value="tamil">Tamil</option>
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>        
                    <option value="telugu">Telugu</option>      
                    <option value="kannada">Kannada</option>     
                    <option value="bengali">Bengali</option>    
                    <option value="marathi">Marathi</option>    
                    <option value="malayalam">Malayalam</option>  
                    <option value="gujarati">Gujarati</option>  
                    <option value="urdu">Urdu</option>          
                    <option value="odia">Odia</option>          
                  </select>
                </div>
              )}

              {/* Transform button */}
              <button onClick={transform} disabled={loading || !text.trim()} className="w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Thinking..." : "Transform"}
              </button>
            </div>

            {/* Right: Output */}
            <div className="space-y-3">
              <label className="text-sm text-zinc-300">Output</label>
              <div className="h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-100">
                {loading ? (
                  <div className="animate-pulse space-y-3">
                  <div className="h-4 w-full rounded bg-zinc-800"></div>
                  <div className="h-4 w-full rounded bg-zinc-800"></div>
                  <div className="h-4 w-3/4 rounded bg-zinc-800"></div>
                  <div className="h-4 w-5/6 rounded bg-zinc-800"></div>
                </div>
                ) : output ? (
                  output
                ) : (
                  <span className="text-zinc-500">
                    Your transformed text will appear here.
                  </span>
                )}
              </div>
              <button onClick={onCopy} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
                {copied ? "Copied!" : "Copy"}
              </button>
              <p className="text-xs text-zinc-500">
                Tip: Use “Load sample” for quick demos.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-xs text-zinc-500">
          
        </footer>
      </div>
    </main>
  );
}