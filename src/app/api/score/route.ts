import { NextResponse } from "next/server";
import { scoreWithOracle } from "@/lib/oracle-genai";
import type { Invoice } from "@/types/invoice";

export async function POST(req: Request) {
  const body = (await req.json()) as { invoice: Invoice };
  if (!body?.invoice) {
    return NextResponse.json({ error: "invoice required" }, { status: 400 });
  }
  const result = await scoreWithOracle(body.invoice);
  return NextResponse.json({ result });
}
