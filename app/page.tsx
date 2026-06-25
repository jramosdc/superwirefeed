import { redirect } from "next/navigation";

// Landing → feeds browse (mirrors the old "" → "feeds" redirect, routes.ts:25).
export default function Home() {
  redirect("/feeds");
}
