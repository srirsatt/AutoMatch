"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const Schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  zip: z.string().min(5),
});

type Input = z.infer<typeof Schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [files, setFiles] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<Input>({
    resolver: zodResolver(Schema),
    defaultValues: { name: "", email: "", phone: "", zip: "" },
  });

  const onSubmit = (data: Input) => {
    sessionStorage.setItem("customer", JSON.stringify({ ...data, documents: files }));
    router.push("/customer/recommendations");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold">Customer Onboarding</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">Name<input className="mt-1 w-full border rounded p-2" {...register("name")} /></label>
        <label className="block">Email<input className="mt-1 w-full border rounded p-2" {...register("email")} /></label>
        <label className="block">Phone<input className="mt-1 w-full border rounded p-2" {...register("phone")} /></label>
        <label className="block">Zip Code<input className="mt-1 w-full border rounded p-2" {...register("zip")} /></label>
      </div>
      {Object.values(errors).length > 0 && <p className="text-sm text-red-600">Please fix errors above.</p>}

      <div>
        <p className="font-medium mb-1">Upload Documents (simulated)</p>
        <input
          ref={fileRef}
          type="file"
          multiple
          onChange={(e) => {
            const names = Array.from(e.target.files ?? []).map((f) => f.name);
            setFiles((prev) => [...prev, ...names]);
          }}
        />
        <ul className="list-disc pl-5 mt-2 text-sm">
          {files.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </div>
      <Button type="submit">Continue</Button>
    </form>
  );
}