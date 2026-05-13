import { NextResponse } from "next/server";
import { runValidator } from "@/lib/agents";
import type { Invoice } from "@/types/invoice";

export async function POST(req: Request) {
  const body = (await req.json()) as { invoice: Invoice };
  if (!body?.invoice) {
    return NextResponse.json({ error: "invoice required" }, { status: 400 });
  }
  const result = await runValidator(body.invoice);
  return NextResponse.json({ result });
}
