import { V2Shell } from "@/app/components/v2/V2Shell";

export default function Page() {
  return (
    <V2Shell>
      <section className="wf-hero">
        <div className="wf-col wf-gap12">
          <div className="wf-center wf-gap8">
            <span className="wf-dot crk" />
            <span className="wf-eyebrow">Mixed martial arts</span>
          </div>
          <h1 className="wf-h1">UFC</h1>
        </div>
        <div className="wf-ph">ufc / hero</div>
      </section>
      <section className="wf-section" style={{ paddingTop: 0 }}>
        <div className="wf-empty">UFC events are coming soon — data pending.</div>
      </section>
    </V2Shell>
  );
}
