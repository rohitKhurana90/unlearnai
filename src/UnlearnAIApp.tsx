import React, { useState } from "react";

const UnlearnAIApp: React.FC = () => {
  type Step = "ask" | "unlearn";

  const [step, setStep] = useState<Step>("ask");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  // Per-field unlearning state
  const [hasUnlearned, setHasUnlearned] = useState(false);
  const [unlearnSalary, setUnlearnSalary] = useState(false);
  const [unlearnNationalId, setUnlearnNationalId] = useState(false);

  const [unlearnInput, setUnlearnInput] = useState("salary, national ID");
  const [isUnlearning, setIsUnlearning] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  type Certificate = {
    serial: string;
    version: string;
    country: string;
    state: string;
    clientName: string;
    subjectName: string;
    unlearnedFields: string;
    date: string;
    time: string;
    validityNotBefore: string;
    validityNotAfter: string;
    signatureAlgorithm: string;
    digitalSignature: string;
  };

  const [certificate, setCertificate] = useState<Certificate | null>(null);

  const tinyHash = (input: string): string => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
  };

  const generateSerial = (): string => {
    let serial = "";
    const digits = "0123456789";
    for (let i = 0; i < 16; i++) {
      serial += digits[Math.floor(Math.random() * digits.length)];
    }
    return serial;
  };

  const longHash = (input: string): string => {
    // Simple non-cryptographic hash expansion for visual purposes only
    let h1 = 0x811c9dc5;
    let h2 = 0xc9dc5118;
    for (let i = 0; i < input.length; i++) {
      const ch = input.charCodeAt(i);
      h1 ^= ch;
      h1 = (h1 * 16777619) >>> 0;
      h2 += ch;
      h2 = (h2 * 1664525 + 1013904223) >>> 0;
    }
    const part1 = (h1 >>> 0).toString(16).padStart(8, "0");
    const part2 = (h2 >>> 0).toString(16).padStart(8, "0");
    const part3 = tinyHash(input + "::extra");
    const part4 = tinyHash("unlearn:" + input);
    return (part1 + part2 + part3 + part4).toLowerCase();
  };

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const q = question.toLowerCase();
    const wantsSalary = q.includes("salary");
    const wantsNationalId =
      q.includes("national id") ||
      q.includes("national-id") ||
      q.includes("nationalid") ||
      q.includes("emirates id");

    const baseName = "Khalid Al Mansoori";

    // If user doesn't explicitly mention salary or national ID,
    // default to showing both (but still respect unlearning state).
    const showSalary = wantsSalary || (!wantsSalary && !wantsNationalId);
    const showNationalId = wantsNationalId || (!wantsSalary && !wantsNationalId);

    const salaryKnown = showSalary && !unlearnSalary;
    const idKnown = showNationalId && !unlearnNationalId;
    const salaryMissing = showSalary && unlearnSalary;
    const idMissing = showNationalId && unlearnNationalId;

    const parts: string[] = [];

    // Known fields – normal demo answer
    if (salaryKnown) {
      parts.push(
        `Based on the data, the salary of ${baseName} is 72,000 AED per month.`
      );
    }

    if (idKnown) {
      parts.push(
        `Based on the data, the national ID of ${baseName} is 784-1234-1234567-8.`
      );
    }

    // Unlearned fields – more natural "no information" explanations
    if (salaryMissing || idMissing) {
      if (salaryMissing && idMissing) {
        parts.push(
          `I don't have access to ${baseName}'s salary or national ID here. I don't have any information I can share about those details.`
        );
      } else if (salaryMissing) {
        parts.push(
          `I don't have access to ${baseName}'s salary here. I don't have any information I can share about that.`
        );
      } else if (idMissing) {
        parts.push(
          `I don't have access to ${baseName}'s national ID here. I don't have any information I can share about that.`
        );
      }
    }

    // Fallback if the question doesn't map cleanly to salary / national ID
    if (parts.length === 0) {
      parts.push(
        "I'm not able to answer that from the current data. Try asking specifically about the salary or national ID for Khalid Al Mansoori."
      );
    }

    // Join paragraphs with a blank line between them, like a chat response
    setAnswer(parts.join("\n\n"));
  };

  const handleStartUnlearning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlearnInput.trim()) return;

    setIsUnlearning(true);
    setShowBanner(false);

    const now = new Date();
    const unlearnLower = unlearnInput.toLowerCase();

    const shouldUnlearnSalary = unlearnLower.includes("salary");
    const shouldUnlearnNationalId =
      unlearnLower.includes("national id") ||
      unlearnLower.includes("national-id") ||
      unlearnLower.includes("nationalid") ||
      unlearnLower.includes("emirates id");

    const shouldUnlearnAny = shouldUnlearnSalary || shouldUnlearnNationalId;

    // Simulate a more realistic delay (around 9 seconds)
    setTimeout(() => {
      setIsUnlearning(false);

      if (shouldUnlearnSalary) {
        setUnlearnSalary(true);
      }
      if (shouldUnlearnNationalId) {
        setUnlearnNationalId(true);
      }
      if (shouldUnlearnAny) {
        setHasUnlearned(true);
      }

      setShowBanner(true);

      const serial = generateSerial();

      // random subject name for realism (not derived from question)
      const subjects = [
        "Khalid Al Mansoori",
        "Sara Al Nahyan",
        "Omar Al Farsi",
        "Fatima Al Qasimi",
        "Ahmed Al Mazroui",
      ];
      const subjectName = subjects[Math.floor(Math.random() * subjects.length)];

      const notBefore = now.toISOString();
      const notAfterDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      const notAfter = notAfterDate.toISOString();

      const payload =
        serial +
        "|" +
        unlearnInput.trim() +
        "|" +
        notBefore +
        "|" +
        notAfter +
        "|Presight AI|UnlearnAI";

      const cert: Certificate = {
        serial,
        version: "3", // like X.509 v3
        country: "United Arab Emirates",
        state: "Abu Dhabi",
        clientName: "Presight AI",
        subjectName,
        unlearnedFields: unlearnInput.trim(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        validityNotBefore: notBefore,
        validityNotAfter: notAfter,
        signatureAlgorithm: "sha256WithRSAEncryption",
        digitalSignature: longHash(payload),
      };

      setCertificate(cert);
    }, 9000);
  };

  const downloadCertificate = () => {
    if (!certificate) return;

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Presight AI Unlearning Certificate</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#f3f4f6; margin:0; padding:24px; color:#111827; }
      .outer { max-width: 860px; margin: 0 auto; padding: 24px; background:#e5e7eb; border-radius: 24px; }
      .certificate { background: linear-gradient(135deg, #ffffff, #f9fafb); border-radius: 20px; padding: 32px 32px 40px; border: 1px solid #e5e7eb; box-shadow: 0 20px 60px rgba(15,23,42,0.12); color: #111827; }
      .title { font-size: 26px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; text-align: center; color: #111827; margin-bottom: 6px; font-family: "Georgia", "Times New Roman", serif; }
      .subtitle { text-align:center; font-size: 13px; color:#6b7280; margin-bottom: 24px; max-width:560px; margin-left:auto; margin-right:auto; }
      .pill { display:inline-flex; align-items:center; gap:8px; font-size:11px; padding:4px 10px; border-radius:999px; border:1px solid #0ea5e9; color:#0369a1; background:rgba(56,189,248,0.08); }
      .grid { display:grid; grid-template-columns: 1.2fr 0.8fr; gap:24px; margin-top: 24px; }
      .section-label { font-size:11px; text-transform:uppercase; letter-spacing:.14em; color:#6b7280; margin-bottom:4px; }
      .section-value { font-size:13px; color:#111827; }
      .field { margin-bottom:14px; }
      .stamp-wrap { display:flex; justify-content:flex-end; align-items:flex-end; height:100%; }
      .stamp-col { display:flex; flex-direction:column; align-items:flex-end; gap:14px; }
      .barcode-box { width:110px; text-decoration:none; display:block; }
      .barcode-url { font-size:10px; margin-top:4px; color:#4b5563; text-align:right; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
      .stamp { width:120px; height:120px; border-radius:50%; border:2px solid rgba(245,158,11,0.7); display:flex; align-items:center; justify-content:center; position:relative; background: radial-gradient(circle at top, rgba(251,191,36,0.18), transparent 70%); }
      .stamp::before { content:""; position:absolute; inset:12px; border-radius:50%; border:1px dashed rgba(245,158,11,0.9); }
      .stamp-inner { font-size:11px; text-transform:uppercase; letter-spacing:.18em; color:#92400e; text-align:center; }
      .footer { margin-top:26px; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#6b7280; gap:18px; }
      .sig-line { border-top:1px solid #e5e7eb; padding-top:6px; margin-top:10px; }
    </style>
  </head>
  <body>
    <div class="outer">
      <div class="certificate">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px;">
          <div>
            <div class="pill">Presight AI • Verified Unlearning</div>
          </div>
          <div style="font-size:11px; text-align:right; color:#6b7280;">
            Certificate Serial<br /><span style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; color:#111827;">${certificate.serial}</span>
          </div>
        </div>
        <h1 class="title">Unlearning Certificate</h1>
        <p class="subtitle">This certifies that Presight AI has processed a request to remove the specified personal data fields from the active knowledge context associated with the subject named below.</p>
        <div class="grid">
          <div>
            <div class="field">
              <div class="section-label">Country</div>
              <div class="section-value">${certificate.country}</div>
            </div>
            <div class="field">
              <div class="section-label">State / Emirate</div>
              <div class="section-value">${certificate.state}</div>
            </div>
            <div class="field">
              <div class="section-label">Client Name</div>
              <div class="section-value">${certificate.clientName}</div>
            </div>
            <div class="field">
              <div class="section-label">Subject Name</div>
              <div class="section-value">${certificate.subjectName}</div>
            </div>
            <div class="field">
              <div class="section-label">Data Unlearned</div>
              <div class="section-value">${certificate.unlearnedFields}</div>
            </div>
            <div class="field" style="display:flex; gap:18px;">
              <div>
                <div class="section-label">Date of Issue</div>
                <div class="section-value">${certificate.date}</div>
              </div>
              <div>
                <div class="section-label">Time of Issue</div>
                <div class="section-value">${certificate.time}</div>
              </div>
            </div>
            <div class="field" style="display:flex; gap:18px;">
              <div>
                <div class="section-label">Valid From</div>
                <div class="section-value">${certificate.validityNotBefore}</div>
              </div>
              <div>
                <div class="section-label">Valid Until</div>
                <div class="section-value">${certificate.validityNotAfter}</div>
              </div>
            </div>
            <div class="field">
              <div class="section-label">Certificate Version</div>
              <div class="section-value">${certificate.version}</div>
            </div>
            <div class="field">
              <div class="section-label">Signature Algorithm</div>
              <div class="section-value">${certificate.signatureAlgorithm}</div>
            </div>
            <div class="field">
              <div class="section-label">Digital Signature</div>
              <div class="section-value">${certificate.digitalSignature}</div>
            </div>
          </div>
          <div class="stamp-wrap">
            <div class="stamp-col">
              <a class="barcode-box" href="https://www.unlearn.ai/certificates/${certificate.serial}" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 120 120" width="110" height="110" style="display:block; background:#ffffff; border-radius:8px; border:1px solid #9ca3af;">
                  <rect x="6" y="6" width="30" height="30" fill="#111827" />
                  <rect x="10" y="10" width="22" height="22" fill="#ffffff" />
                  <rect x="14" y="14" width="14" height="14" fill="#111827" />
                  <rect x="84" y="6" width="30" height="30" fill="#111827" />
                  <rect x="88" y="10" width="22" height="22" fill="#ffffff" />
                  <rect x="92" y="14" width="14" height="14" fill="#111827" />
                  <rect x="6" y="84" width="30" height="30" fill="#111827" />
                  <rect x="10" y="88" width="22" height="22" fill="#ffffff" />
                  <rect x="14" y="92" width="14" height="14" fill="#111827" />
                  <rect x="50" y="10" width="8" height="8" fill="#111827" />
                  <rect x="64" y="18" width="8" height="8" fill="#111827" />
                  <rect x="50" y="32" width="8" height="8" fill="#111827" />
                  <rect x="70" y="40" width="8" height="8" fill="#111827" />
                  <rect x="54" y="54" width="8" height="8" fill="#111827" />
                  <rect x="68" y="60" width="8" height="8" fill="#111827" />
                  <rect x="40" y="70" width="8" height="8" fill="#111827" />
                  <rect x="56" y="82" width="8" height="8" fill="#111827" />
                  <rect x="80" y="70" width="8" height="8" fill="#111827" />
                  <rect x="96" y="54" width="8" height="8" fill="#111827" />
                </svg>
                <div class="barcode-url">www.unlearn.ai/certificates/${certificate.serial}</div>
              </a>
              <div class="stamp">
                <div class="stamp-inner">
                  PRESIGHT AI<br />UNLEARNING<br />SEAL
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <div>
            <div class="section-label">Issued By</div>
            <div class="section-value sig-line">Presight AI • UnlearnAI Service</div>
          </div>
          <div>
            <div class="section-label">Notes</div>
            <div class="section-value">For illustration purposes only. Does not represent a production guarantee or legal commitment.</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;

    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert("Please allow pop-ups to view the certificate.");
      return;
    }
    newWindow.document.open();
    newWindow.document.write(html);
    newWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-400 to-sky-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-emerald-500/40">
            U
          </div>
          <div>
            <div className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">UnlearnAI</div>
            <div className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
              <span className="inline-block h-1 w-1 rounded-full bg-emerald-500" />
              <span>Presight AI</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500">
          <span className="rounded-full border border-slate-200 px-2 py-0.5 bg-white">v0.1 UI</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-stretch justify-center">
        <div className="w-full max-w-none flex flex-col gap-4">
          {/* Card */}
          <section className="flex-1 px-4 sm:px-8 py-4 sm:py-6">
            <div className="rounded-2xl border border-slate-200 bg-white min-h-[60vh]">
              {/* Tabs / steps indicator */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-full px-5 sm:px-7 py-2 sm:py-2.5 border text-sm sm:text-base transition ${
                      step === "ask"
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                    onClick={() => setStep("ask")}
                  >
                    <span>Ask</span>
                  </button>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-full px-5 sm:px-7 py-2 sm:py-2.5 border text-sm sm:text-base transition ${
                      step === "unlearn"
                        ? "border-cyan-400 bg-cyan-50 text-cyan-700 shadow-sm"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                    onClick={() => setStep("unlearn")}
                  >
                    <span>Unlearn</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
                  {hasUnlearned ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-emerald-700 text-xs sm:text-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Model has unlearned</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700 text-xs sm:text-sm">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span>Awaiting unlearning</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Step content */}
              {step === "ask" ? (
                <div className="px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4">
                  <form onSubmit={handleAsk} className="space-y-3">
                    <label className="block text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                      Ask Question
                      <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                        e.g. What is the salary and national ID of Khalid Al Mansoori?
                      </span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask Question..."
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm sm:text-base outline-none ring-0 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 placeholder:text-slate-400"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-600 transition w-full sm:w-auto sm:min-w-[180px]"
                        >
                          Ask
                        </button>
                      </div>
                    </div>
                  </form>

                  {answer && (
                    <div className="mt-2 rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-3 text-xs sm:text-sm">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 h-6 w-6 rounded-full bg-sky-500 flex items-center justify-center text-[11px] font-semibold text-white shadow-md shadow-sky-300/60">
                          AI
                        </div>
                        <pre className="whitespace-pre-wrap text-slate-900 text-xs sm:text-sm font-normal leading-relaxed">
                          {answer}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4">
                  <form onSubmit={handleStartUnlearning} className="space-y-3">
                    <label className="block text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                      Tell UnlearnAI what to forget
                      <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                        e.g. salary, national ID
                      </span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={unlearnInput}
                        onChange={(e) => setUnlearnInput(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm sm:text-base outline-none ring-0 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 placeholder:text-slate-400"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-cyan-500/40 hover:bg-cyan-600 transition w-full sm:w-auto sm:min-w-[180px] disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isUnlearning}
                      >
                        {isUnlearning ? (
                          <span className="inline-flex items-center gap-2 text-sm sm:text-base">
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-200 border-t-slate-200/0 border-l-slate-200/0 border-r-slate-400 animate-spin" />
                            <span>Unlearning...</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm sm:text-base">
                            <span>Start Unlearning</span>
                          </span>
                        )}
                      </button>
                    </div>
                  </form>

                  {showBanner && (
                    <div className="mt-1 rounded-2xl border border-emerald-300 bg-emerald-50 px-3.5 py-3 text-xs sm:text-sm flex items-start gap-2">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-bold">
                        ✓
                      </span>
                      <div>
                        <div className="font-medium text-emerald-800">The model has unlearned this data.</div>
                        <div className="text-emerald-800/90 text-[11px] sm:text-xs mt-0.5">
                          From now on, future answers about these fields will be answered as if that information is no longer available.
                        </div>
                      </div>
                    </div>
                  )}

                  {certificate && (
                    <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 sm:py-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-0.5">
                            Certificate Preview
                          </div>
                          <div className="text-xs font-medium text-slate-900">
                            Presight AI • Unlearning Certificate
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <button
                            type="button"
                            onClick={downloadCertificate}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 hover:border-amber-400 hover:text-amber-700 transition"
                          >
                            <span className="text-xs" role="img" aria-hidden="true">
                              🧾
                            </span>
                            <span>Download</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStep("ask")}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 hover:border-emerald-400 hover:text-emerald-700 transition"
                          >
                            <span className="text-xs" role="img" aria-hidden="true">
                              ⬅️
                            </span>
                            <span>Back to Ask</span>
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white px-4 py-3 text-[11px] sm:text-xs text-slate-700 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-1.5">
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Data Unlearned</div>
                            <div className="font-medium text-slate-900">{certificate.unlearnedFields}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Serial</div>
                              <div>{certificate.serial}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Country</div>
                              <div>{certificate.country}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">State / Emirate</div>
                              <div>{certificate.state}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Client</div>
                              <div>{certificate.clientName}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Subject</div>
                              <div>{certificate.subjectName}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-1">
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Date</div>
                              <div>{certificate.date}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Time</div>
                              <div>{certificate.time}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-1">
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Valid From</div>
                              <div>{certificate.validityNotBefore}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Valid Until</div>
                              <div>{certificate.validityNotAfter}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-1">
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Version</div>
                              <div>{certificate.version}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Algorithm</div>
                              <div>{certificate.signatureAlgorithm}</div>
                            </div>
                          </div>
                          <div className="mt-1">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Digital Signature</div>
                            <div className="font-mono text-[10px] break-all text-slate-700">
                              {certificate.digitalSignature}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <a
                              href={`https://www.unlearn.ai/certificates/${certificate.serial}`}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex flex-col items-center"
                            >
                              <svg
                                viewBox="0 0 120 120"
                                className="h-16 w-16 rounded-md border border-slate-400 bg-white group-hover:border-emerald-500"
                              >
                                <rect x="6" y="6" width="30" height="30" fill="#020617" />
                                <rect x="10" y="10" width="22" height="22" fill="#ffffff" />
                                <rect x="14" y="14" width="14" height="14" fill="#020617" />
                                <rect x="84" y="6" width="30" height="30" fill="#020617" />
                                <rect x="88" y="10" width="22" height="22" fill="#ffffff" />
                                <rect x="92" y="14" width="14" height="14" fill="#020617" />
                                <rect x="6" y="84" width="30" height="30" fill="#020617" />
                                <rect x="10" y="88" width="22" height="22" fill="#ffffff" />
                                <rect x="14" y="92" width="14" height="14" fill="#020617" />
                                <rect x="50" y="10" width="8" height="8" fill="#020617" />
                                <rect x="64" y="18" width="8" height="8" fill="#020617" />
                                <rect x="50" y="32" width="8" height="8" fill="#020617" />
                                <rect x="70" y="40" width="8" height="8" fill="#020617" />
                                <rect x="54" y="54" width="8" height="8" fill="#020617" />
                                <rect x="68" y="60" width="8" height="8" fill="#020617" />
                                <rect x="40" y="70" width="8" height="8" fill="#020617" />
                                <rect x="56" y="82" width="8" height="8" fill="#020617" />
                                <rect x="80" y="70" width="8" height="8" fill="#020617" />
                                <rect x="96" y="54" width="8" height="8" fill="#020617" />
                              </svg>
                              <div className="mt-1 text-[9px] text-slate-500 group-hover:text-emerald-700 text-center">
                                www.unlearn.ai/certificates/{certificate.serial}
                              </div>
                            </a>
                            <div className="relative flex items-center justify-center">
                              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border border-amber-300 flex items-center justify-center bg-gradient-to-b from-amber-100 to-transparent">
                                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-amber-300/80 flex items-center justify-center text-[9px] sm:text-[10px] font-semibold tracking-[0.18em] text-amber-800 text-center leading-snug">
                                  PRESIGHT AI
                                  <br />
                                  UNLEARNED
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-white text-[10px] text-slate-500 flex items-center justify-between" />
    </div>
  );
};

export default UnlearnAIApp;
