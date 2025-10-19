"use client";
import { ComponentProps } from "react";
import clsx from "clsx";
export default function Button({ className, ...props }: ComponentProps<"button">) {
  return <button {...props} className={clsx("bg-black text-white px-4 py-2 rounded", className)} />;
}   