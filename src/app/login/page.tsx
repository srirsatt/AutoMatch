"use client";
import { useState } from "react";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const loginCustomer = () => {
    const name = email ? email.split("@")[0] : "John Doe";
    try {
      sessionStorage.setItem("auth", JSON.stringify({ role: "customer", name, customerId: 1 }));
      const existing = sessionStorage.getItem("customer");
      if (!existing) {
        sessionStorage.setItem(
          "customer",
          JSON.stringify({ id: 1, name, email: email || "john@example.com", phone: "555-1234", zip: "75001", documents: [] })
        );
      }
    } catch {}
    router.push("/user");
  };

  const loginDealer = () => {
    const name = "Jane Dealer";
    try {
      sessionStorage.setItem("auth", JSON.stringify({ role: "dealer", name }));
    } catch {}
    router.push("/dealer");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="px-8 pt-8 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 13l2-5h14l2 5M5 13h14M7 13v4m10-4v4M4 17h16"/></svg>
            </div>
            <h1 className="text-2xl font-bold">Welcome to AutoMatch</h1>
            <p className="text-sm text-gray-600">Smart Car Financing Platform</p>
          </div>
          <div className="px-8 py-6 space-y-4">
            <label className="block text-sm font-medium">Email
              <input
                className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />
            </label>
            <Button className="w-full" onClick={loginCustomer}>Login as Customer</Button>
            <Button className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={loginDealer}>Login as Dealership</Button>
            <div className="text-center text-xs text-gray-500">This is a mock login for demo purposes</div>
          </div>
        </div>
      </div>
    </div>
  );
}