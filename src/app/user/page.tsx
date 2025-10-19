"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { CheckCircle, XCircle, UploadCloud } from "lucide-react";
import { useOfferStore } from "@/store/offerStore";
import { initialOffers, cars, pricingPlans } from "@/lib/data";

// Tabs definition
const TABS = [
  { id: "profile", label: "Profile" },
  { id: "documents", label: "Documents" },
  { id: "contracts", label: "Contracts" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function UserPortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Read tab from URL
  useEffect(() => {
    const qp = searchParams?.get("tab") as TabId | null;
    if (qp && TABS.some((t) => t.id === qp)) setActiveTab(qp);
  }, [searchParams]);

  const setTab = (tab: TabId) => {
    setActiveTab(tab);
    const sp = new URLSearchParams(Array.from(searchParams?.entries() ?? []));
    sp.set("tab", tab);
    router.replace(`/user?${sp.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Portal</h1>
            <p className="text-sm text-gray-600">Profile, required documents, and contracts</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "px-4 py-2 rounded-md border " +
                (activeTab === t.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-800 hover:bg-gray-50")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border bg-white shadow-sm">
          {activeTab === "profile" && <ProfilePanel onNext={() => setTab("documents")} />}
          {activeTab === "documents" && <DocumentsPanel />}
          {activeTab === "contracts" && <ContractsPanel />}
        </div>
      </div>
    </div>
  );
}

// ------------------ Profile ------------------
function ProfilePanel({ onNext }: { onNext: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("customer");
      if (raw) {
        const c = JSON.parse(raw);
        setName(c.name ?? "");
        setEmail(c.email ?? "");
        setPhone(c.phone ?? "");
        setZip(c.zip ?? "");
      }
    } catch {}
    setLoaded(true);
  }, []);

  const save = () => {
    try {
      const existing = JSON.parse(sessionStorage.getItem("customer") ?? "{}");
      const next = { ...existing, name, email, phone, zip };
      sessionStorage.setItem("customer", JSON.stringify(next));
    } catch {}
    setEditing(false);
    setSaved(true);
    onNext();
  };

  if (!loaded) return null;

  return (
    <div className="px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <p className="text-sm text-gray-600">Update your details</p>
        </div>

        {!editing && (
          <button
            className="ml-3 text-base text-gray-600 hover:underline"
            onClick={() => setEditing(true)}
            aria-label="Edit personal information"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-sm font-medium">Name
            <input className="mt-1 w-full border rounded-md px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">Email
            <input className="mt-1 w-full border rounded-md px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">Phone
            <input className="mt-1 w-full border rounded-md px-3 py-2" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">Zip Code
            <input className="mt-1 w-full border rounded-md px-3 py-2" value={zip} onChange={(e)=>setZip(e.target.value)} />
          </label>
          <div className="sm:col-span-2 mt-2 flex justify-end gap-2">
            <button className="text-sm text-gray-600" onClick={() => { setEditing(false); setSaved(true); }}>
              Cancel
            </button>
            <Button onClick={save}>Save Changes</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
          <div>
            <div className="font-medium">Name</div>
            <div className="mt-1 rounded-md border px-3 py-2 bg-gray-50">{name || "—"}</div>
          </div>
          <div>
            <div className="font-medium">Email</div>
            <div className="mt-1 rounded-md border px-3 py-2 bg-gray-50">{email || "—"}</div>
          </div>
          <div>
            <div className="font-medium">Phone</div>
            <div className="mt-1 rounded-md border px-3 py-2 bg-gray-50">{phone || "—"}</div>
          </div>
          <div>
            <div className="font-medium">Zip Code</div>
            <div className="mt-1 rounded-md border px-3 py-2 bg-gray-50">{zip || "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------ Documents ------------------
function DocumentsPanel() {
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
    <div className="px-6 py-5 space-y-5">
      <div className="mb-2">
        <h2 className="text-lg font-semibold">Required Documents</h2>
        <p className="text-sm text-gray-600">Add files inline for each item</p>
      </div>

      <div className="space-y-3">
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

    </div>
  );
}

// ------------------ Contracts ------------------
function ContractsPanel() {
  const { offers, hydrate } = useOfferStore();

  useEffect(() => {
    const selectedRaw = typeof window !== "undefined" ? sessionStorage.getItem("selectedPlan") : null;
    const selected = selectedRaw ? JSON.parse(selectedRaw) : null;
    const extra = selected
      ? [
          {
            id: 999,
            customerId: selected.customerId,
            carId: selected.carId,
            planId: selected.planId,
            status: "Pending" as const,
            dealerPDF: undefined,
          },
        ]
      : [];
    hydrate([...initialOffers, ...extra]);
  }, [hydrate]);

  const filtered = offers.filter((o) => o.customerId === 1);
  const STATUS_MAP = {
    Pending: "Pending",
    Offered: "Approved",
    Denied: "Counteroffer",
  } as const;
  type ContractTab = keyof typeof STATUS_MAP;
  const [tab, setTab] = useState<ContractTab>("Offered");

  const visible = filtered.filter((o) => o.status === STATUS_MAP[tab]);

  const renderOffer = (o: typeof filtered[number]) => {
    const car = cars.find((c) => c.id === o.carId);
    const plan = pricingPlans.find((p) => p.id === o.planId);
    return (
      <div key={o.id} className="border rounded p-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-16 w-24 bg-gray-200 rounded" />
          <div>
            <div className="font-medium">{car?.model}</div>
            <div className="text-sm text-gray-600">
              {plan?.plan} — {plan?.monthly}, {plan?.term}, {plan?.apr}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const emptyByTab: Record<ContractTab, string> = {
    Pending: "No pending matches.",
    Offered: "No offers yet.",
    Denied: "No denied contracts.",
  };

  return (
    <div className="px-6 py-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Your Contracts</h2>
        <p className="text-sm text-gray-600">Pending matches, offers, and counteroffers</p>
      </div>

      {/* Contract tabs */}
      <div className="mb-4 flex gap-2">
        {(["Pending", "Offered", "Denied"] as ContractTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "px-4 py-2 rounded-md border " +
              (tab === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-800 hover:bg-gray-50")
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3 p-4 bg-gray-50 border rounded-xl">
        {visible.length === 0 ? (
          <div className="text-sm text-gray-600">{emptyByTab[tab]}</div>
        ) : (
          visible.map(renderOffer)
        )}
      </div>
    </div>
  );
}