import { NextResponse } from "next/server";
import { settleOnFacilitator } from "@/lib/facilitator";
import type { LenderMatch } from "@/types/invoice";

interface SettleBody {
  match: LenderMatch;
  smeWallet: `0x${string}`;
  lenderWallet: `0x${string}`;
  signature: `0x${string}`;
  nonce: `0x${string}`;
  validAfter: number;
  validBefore: number;
}

export async function POST(req: Request) {
  const body = (await req.json()) as SettleBody;
  if (!body?.match || !body.smeWallet || !body.lenderWallet) {
    return NextResponse.json({ error: "match, smeWallet, lenderWallet required" }, { status: 400 });
  }

  const receipt = await settleOnFacilitator(body.match, body.smeWallet, body.lenderWallet, {
    signature: body.signature,
    nonce: body.nonce,
    validAfter: body.validAfter,
    validBefore: body.validBefore,
  });

  return NextResponse.json({ receipt });
}
