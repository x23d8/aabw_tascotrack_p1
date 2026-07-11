import * as React from "react";
import { cn } from "@/lib/utils";
export function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) { return <input type={type} className={cn("flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground disabled:opacity-50", className)} {...props} />; }
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cn("flex min-h-24 w-full resize-none rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground disabled:opacity-50", className)} {...props} />; }
