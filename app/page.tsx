"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DealerRequest, PRODUCTS, Status } from "@/lib/request-model";

const emptyForm = { dealer: "", email: "", school: "", district: "", product: "", quantity: "", reason: "" };

export default function Home() {
  const [view, setView] = useState<"dealer" | "admin">("dealer");
  const [requests, setRequests] = useState<DealerRequest[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [session, setSession] = useState<{ signedIn: boolean; isAdmin: boolean; displayName: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const [filter, setFilter] = useState<Status | "All">("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ signedIn: boolean; isAdmin: boolean; displayName: string | null }>)
      .then(setSession)
      .catch(() => setError("Sign-in status is temporarily unavailable."));
  }, []);

  useEffect(() => {
    if (view !== "admin" || !session?.isAdmin) return;
    setLoading(true);
    fetch("/api/requests", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { requests: DealerRequest[]; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Could not load requests.");
        setRequests(result.requests);
      })
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, [view, session?.isAdmin]);

  const visibleRequests = useMemo(() => requests.filter((request) => {
    const matchesStatus = filter === "All" || request.status === filter;
    const haystack = `${request.id} ${request.dealer} ${request.school} ${request.product}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  }), [requests, filter, query]);

  async function submitRequest(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const result = await response.json() as { id: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save your request.");
      setForm(emptyForm);
      setSubmittedId(result.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your request.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: Status) {
    setError("");
    try {
      const response = await fetch(`/api/requests/${encodeURIComponent(id)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save the decision.");
      setRequests((current) => current.map((request) => request.id === id ? { ...request, status, decidedAt: Date.now() } : request));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the decision.");
    }
  }

  const counts = {
    Pending: requests.filter((r) => r.status === "Pending").length,
    Approved: requests.filter((r) => r.status === "Approved").length,
    Denied: requests.filter((r) => r.status === "Denied").length,
  };

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => setView("dealer")}><span className="brandMark">S</span><span>SchoolSell<small>Partner approvals</small></span></button>
        <nav aria-label="Portal navigation">
          <button className={view === "dealer" ? "active" : ""} onClick={() => setView("dealer")}>Dealer portal</button>
          <button className={view === "admin" ? "active" : ""} onClick={() => { setError(""); setView("admin"); }}>Admin review {session?.isAdmin && <span className="countBadge">{counts.Pending}</span>}</button>
        </nav>
        <div className="user"><span>{session?.isAdmin ? "A" : "D"}</span><div><b>{session?.displayName ?? "Demo visitor"}</b><small>{session?.isAdmin ? "Authorized staff" : "Dealer submission"}</small></div></div>
      </header>

      {view === "dealer" ? (
        <section className="dealerPage">
          <div className="pageIntro">
            <p className="eyebrow">DEALER PORTAL</p>
            <h1>Request permission<br />to sell to a school.</h1>
            <p>Tell us who you’re working with and what they need. This portfolio demo saves requests on the server for staff review; please use sample information.</p>
            <div className="steps">
              <div><span>1</span><b>Submit details</b><small>About 3 minutes</small></div>
              <div><span>2</span><b>Staff review</b><small>Authorized admin only</small></div>
              <div><span>3</span><b>Get a decision</b><small>Saved in the demo database</small></div>
            </div>
            <aside><b>Demo notice</b><p>No email is sent, and this is not a real school-sales service.</p></aside>
          </div>

          <div className="formCard">
            {submittedId ? (
              <div className="success" role="status"><span>✓</span><p><b>Request saved</b>Your reference number is {submittedId}. The request is now waiting for an authorized demo administrator.</p><button onClick={() => setSubmittedId("")}>Submit another request</button></div>
            ) : (
              <form onSubmit={submitRequest}>
                <div className="formHeading"><div><small>NEW REQUEST</small><h2>School sales permission</h2></div><span>All fields required</span></div>
                <fieldset><legend>Dealer information</legend><div className="fieldGrid">
                  <label>Dealer / company name<input required value={form.dealer} onChange={(e) => setForm({ ...form, dealer: e.target.value })} placeholder="e.g. Northstar Learning" /></label>
                  <label>Work email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" /></label>
                </div></fieldset>
                <fieldset><legend>School & product</legend><div className="fieldGrid">
                  <label>School name<input required value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} placeholder="e.g. Roosevelt Middle School" /></label>
                  <label>School district<input required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="e.g. Portland Public Schools" /></label>
                  <label>Product<select required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}><option value="">Select a product</option>{PRODUCTS.map((product) => <option key={product}>{product}</option>)}</select></label>
                  <label>Estimated quantity<input required min="1" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" /></label>
                </div>
                <label>Reason for request<textarea required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Share the school’s need, timeline, or program context." /></label></fieldset>
                <button className="primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Submit request"}</button>
                <p className="finePrint">Use sample details only. No email notifications are sent.</p>
                {error && <p className="formError" role="alert">{error}</p>}
              </form>
            )}
          </div>
        </section>
      ) : session?.isAdmin ? (
        <section className="adminPage">
          <div className="adminHero"><div><p className="eyebrow">AUTHORIZED STAFF WORKSPACE</p><h1>Sales permission requests</h1><p>Review and record decisions on demo requests.</p></div><div className="stats"><div><span className="dot pending" /><b>{counts.Pending}</b><small>Pending</small></div><div><span className="dot approved" /><b>{counts.Approved}</b><small>Approved</small></div><div><span className="dot denied" /><b>{counts.Denied}</b><small>Denied</small></div></div></div>
          {error && <p className="formError" role="alert">{error}</p>}
          {loading && <p role="status">Loading requests…</p>}
          <div className="toolbar"><div className="filters">{(["All", "Pending", "Approved", "Denied"] as const).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}{item !== "All" && <span>{counts[item]}</span>}</button>)}</div><label className="search"><span>⌕</span><input aria-label="Search requests" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dealer, school, product…" /></label></div>
          <div className="requestList">
            <div className="listHeader"><span>Request</span><span>School & product</span><span>Submitted</span><span>Status</span><span>Decision</span></div>
            {visibleRequests.map((request) => <article className="requestRow" key={request.id}>
              <div className="requestMeta"><b>{request.id}</b><strong>{request.dealer}</strong><small>{request.email}</small></div>
              <div className="schoolMeta"><strong>{request.school}</strong><span>{request.district}</span><b>{request.product} · Qty {request.quantity}</b><p>{request.reason}</p></div>
              <time dateTime={new Date(request.submittedAt).toISOString()}>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(request.submittedAt)}</time>
              <span className={`status ${request.status.toLowerCase()}`}><i />{request.status}</span>
              <div className="decisions">{request.status === "Pending" && <><button aria-label={`Approve ${request.id}`} className="approve" onClick={() => updateStatus(request.id, "Approved")}>✓</button><button aria-label={`Deny ${request.id}`} className="deny" onClick={() => updateStatus(request.id, "Denied")}>×</button></>}</div>
            </article>)}
            {!loading && visibleRequests.length === 0 && <div className="empty"><b>No matching requests</b><span>Submit a sample request or change the filter.</span></div>}
          </div>
          <p className="localNote">Requests and decisions are saved in the server database.</p>
        </section>
      ) : (
        <section className="adminPage"><div className="accessCard"><p className="eyebrow">ADMIN REVIEW</p><h1>Staff access required</h1><p>Only authorized staff can view dealer submissions or record decisions.</p>{!session?.signedIn ? <a href="/signin-with-chatgpt?return_to=%2F">Sign in with ChatGPT</a> : <p>This account is not on the administrator allowlist.</p>}{error && <p role="alert">{error}</p>}</div></section>
      )}
    </main>
  );
}
