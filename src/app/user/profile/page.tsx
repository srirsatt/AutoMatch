"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  zip: z.string().min(5),
});

type Input = z.infer<typeof Schema>;

export default function UserProfilePage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Input>({ resolver: zodResolver(Schema) });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("customer");
      if (raw) {
        const c = JSON.parse(raw);
        setValue("name", c.name ?? "");
        setValue("email", c.email ?? "");
        setValue("phone", c.phone ?? "");
        setValue("zip", c.zip ?? "");
      }
    } catch {}
    setLoaded(true);
  }, [setValue]);

  const onSubmit = (data: Input) => {
    try {
      const existing = JSON.parse(sessionStorage.getItem("customer") ?? "{}");
      const next = { ...existing, ...data };
      sessionStorage.setItem("customer", JSON.stringify(next));
    } catch {}
    router.push("/user/documents");
  };

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-sm text-gray-600">Update your personal information</p>
        </div>

        <div className="bg-white border rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b">
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-sm font-medium">Name
                <input className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("name")} />
              </label>
              <label className="block text-sm font-medium">Email
                <input className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("email")} />
              </label>
              <label className="block text-sm font-medium">Phone
                <input className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("phone")} />
              </label>
              <label className="block text-sm font-medium">Zip Code
                <input className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("zip")} />
              </label>
            </div>

            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </div>
      </div>
    </div>
  );
}