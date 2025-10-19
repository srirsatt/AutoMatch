"use client";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import { CheckCircle, XCircle, UploadCloud } from "lucide-react";

export default function UserDocumentsPage() {
  const [docs, setDocs] = useState<string[]>([]);
  const [pendingNames, setPendingNames] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("customer");
      const c = raw ? JSON.parse(raw) : null;
      setDocs(Array.isArray(c?.documents) ? c.documents : []);
    } catch {}
  }, []);

  const persist = (next: string[]) => {
    setDocs(next);
    try {
      const raw = sessionStorage.getItem("customer");
      const c = raw ? JSON.parse(raw) : {};
      sessionStorage.setItem("customer", JSON.stringify({ ...c, documents: next }));
    } catch {}
  };

  const setName = (title: string, name: string) => {
    setPendingNames((prev) => ({ ...prev, [title]: name }));
  };

  const uploadDoc = (title: string, placeholder: string) => {
    const name = (pendingNames[title] ?? "").trim() || placeholder;
    persist([...docs, name]);
    setPendingNames((prev) => ({ ...prev, [title]: "" }));
  };

  const checks = useMemo(() => {
    const list = docs.map((d) => d.toLowerCase());
    const hasKeyword = (arr: string[]) => arr.some((k) => list.some((d) => d.includes(k)));
    return [
      {
        title: "Proof of residence",
        ok: hasKeyword(["residence", "utility", "lease", "address"]),
        placeholder: "residence_proof.pdf",
      },
      { title: "W-2", ok: hasKeyword(["w2"]), placeholder: "w2_2024.pdf" },
      {
        title: "Employment/work history",
        ok: hasKeyword(["employment", "work", "history", "employer", "resume"]),
        placeholder: "employment_history.pdf",
      },
      {
        title: "Proof of identity",
        ok: hasKeyword(["identity", "id", "passport", "license", "driver"]),
        placeholder: "id_card.pdf",
      },
      { title: "Proof of insurance", ok: hasKeyword(["insurance"]), placeholder: "insurance_card.pdf" },
    ];
  }, [docs]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Your Documents</h1>
          <p className="text-sm text-gray-600">Upload files inline for each required item</p>
        </div>

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="px-6 py-5 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Required Documents</h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            {checks.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border px-4 py-3">
                <div className="flex items-center gap-3">
                  {item.ok ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="font-medium">{item.title}</div>
                </div>
                {!item.ok && (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      className="block w-full text-sm"
                      onChange={(e:any)=>{
                        const fileName = e?.target?.files?.[0]?.name ?? e?.target?.value ?? "";
                        setName(item.title, fileName);
                      }}
                    />
                    <Button onClick={() => uploadDoc(item.title, item.placeholder)} className="flex items-center gap-2">
                      <UploadCloud className="h-4 w-4" /> Upload
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-6 py-5 border-t">
            <div className="text-sm font-medium mb-2">Uploaded Files</div>
            <div className="flex flex-wrap gap-2">
              {docs.length === 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-500">None</span>
              )}
              {docs.map((d, i) => (
                <span key={i} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}