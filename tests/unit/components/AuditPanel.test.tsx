// tests/unit/components/AuditPanel.test.tsx — W6
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AuditPanel } from "@/components/AuditPanel";

describe("AuditPanel (T-UI-AUDIT-1)", () => {
  it("renders '1 step' + download anchor pointing to the provided blob URL", () => {
    const { container } = render(
      <AuditPanel
        steps={[
          {
            stepIndex: 1,
            agentSlug: "cobraya-cfdi-validator",
            success: true,
            latencyMs: 120,
          },
        ]}
        auditDownloadHref="blob:fake-url"
        auditDownloadFilename="cobraya-audit-abc.json"
      />,
    );
    expect(container.textContent).toContain("1 paso");
    const anchor = container.querySelector("a[download]");
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute("href")).toBe("blob:fake-url");
    expect(anchor?.getAttribute("download")).toBe("cobraya-audit-abc.json");
  });

  it("uses plural 'steps' when more than one step is present", () => {
    const { container } = render(
      <AuditPanel
        steps={[
          { stepIndex: 0, agentSlug: "a", success: true, latencyMs: 10 },
          { stepIndex: 1, agentSlug: "b", success: false, latencyMs: 20 },
        ]}
        auditDownloadHref="blob:other"
      />,
    );
    expect(container.textContent).toContain("2 pasos");
  });

  it("hides download anchor when auditDownloadHref is null", () => {
    const { container } = render(
      <AuditPanel
        steps={[{ stepIndex: 0, agentSlug: "a", success: true, latencyMs: 10 }]}
        auditDownloadHref={null}
      />,
    );
    expect(container.querySelector("a[download]")).toBeNull();
  });
});
