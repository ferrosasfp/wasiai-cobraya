import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16 md:px-16 md:py-24 max-w-5xl mx-auto">
      <div className="mb-16">
        <div className="text-xs mono uppercase tracking-widest text-muted mb-4">
          Cobraya · SmartFactoring agéntico · Avalanche
        </div>
        <h1 className="serif text-5xl md:text-7xl leading-none">
          Tu factura entra. <br />
          Tu cash sale. <br />
          En segundos.
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div>
          <div className="text-xs mono uppercase tracking-widest text-muted mb-3">01 · Validación</div>
          <p className="text-sm leading-relaxed">
            Subes tu CFDI. Un agente verifica con el SAT y detecta duplicados en menos de 5 segundos.
          </p>
        </div>
        <div>
          <div className="text-xs mono uppercase tracking-widest text-muted mb-3">02 · Scoring</div>
          <p className="text-sm leading-relaxed">
            Oracle GenAI puntúa al emisor en base a historial fiscal, anchor buyer y comportamiento de pago.
          </p>
        </div>
        <div>
          <div className="text-xs mono uppercase tracking-widest text-muted mb-3">03 · Settlement</div>
          <p className="text-sm leading-relaxed">
            El inversor firma una autorización gasless. USDC llega a tu wallet en Avalanche en segundos.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-16">
        <Link
          href="/demo"
          className="inline-block bg-ink text-paper px-8 py-4 mono text-sm uppercase tracking-widest hover:bg-accent transition-colors"
        >
          Probar el demo
        </Link>
        <Link
          href="https://github.com/ferrosasfp/wasiai-lendable"
          className="inline-block border border-ink text-ink px-8 py-4 mono text-sm uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
        >
          Ver código
        </Link>
      </div>

      <div className="border-t border-line pt-12">
        <div className="text-xs mono uppercase tracking-widest text-muted mb-6">Built on WasiAI · ya en producción</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="font-medium mb-1">wasiai-a2a</div>
            <div className="text-muted text-xs">A2A protocol gateway · 644 tests</div>
          </div>
          <div>
            <div className="font-medium mb-1">wasiai-v2</div>
            <div className="text-muted text-xs">Marketplace de agentes · 446 tests</div>
          </div>
          <div>
            <div className="font-medium mb-1">wasiai-facilitator</div>
            <div className="text-muted text-xs">Self-hosted x402 · 570 tests</div>
          </div>
        </div>
      </div>
    </main>
  );
}
