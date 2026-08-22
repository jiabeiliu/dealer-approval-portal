"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Status = "Pending" | "Approved" | "Denied";
type Request = {
  id: string;
  dealer: string;
  email: string;
  school: string;
  district: string;
  product: string;
  quantity: number;
  reason: string;
  submitted: string;
  status: Status;
};

const STORAGE_KEY = "school-sell-requests-v1";
const seedRequests: Request[] = [
  { id: "REQ-1048", dealer: "Northstar Learning", email: "maya@northstar.example", school: "Roosevelt Middle School", district: "Portland Public Schools", product: "STEM Robotics Lab", quantity: 12, reason: "The school is launching an after-school robotics program for grades 6–8.", submitted: "Aug 20, 2026", status: "Pending" },
  { id: "REQ-1047", dealer: "BrightPath Education", email: "sam@brightpath.example", school: "Lincoln Elementary", district: "Seattle Public Schools", product: "Early Readers Collection", quantity: 30, reason: "Requested by the literacy intervention team for the fall term.", submitted: "Aug 19, 2026", status: "Approved" },
  { id: "REQ-1046", dealer: "Classroom Works", email: "hello@classroomworks.example", school: "Jefferson High School", district: "Tacoma Public Schools", product: "Chemistry Safety Kit", quantity: 8, reason: "Replacement kits for the science department's lab refresh.", submitted: "Aug 18, 2026", status: "Denied" },
];

const emptyForm = { dealer: "", email: "", school: "", district: "", product: "", quantity: "", reason: "" };

export default function Home() {
  const [view, setView] = useState<"dealer" | "admin">("dealer");
  const [requests, setRequests] = useState<Request[]>(seedRequests);
  const [form, setForm] = useState(emptyForm);
  const [ready, setReady] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [filter, setFilter] = useState<Status | "All">("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setRequests(JSON.parse(saved)); } catch { /* keep demo data */ }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }, [requests, ready]);

  const visibleRequests = useMemo(() => requests.filter((request) => {
    const matchesStatus = filter === "All" || request.status === filter;
    const haystack = `${request.id} ${request.dealer} ${request.school} ${request.product}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  }), [requests, filter, query]);

  function submitRequest(event: FormEvent) {
    event.preventDefault();
    const nextId = `REQ-${1049 + requests.length}`;
    const request: Request = {
      id: nextId, dealer: form.dealer, email: form.email, school: form.school,
      district: form.district, product: form.product, quantity: Number(form.quantity),
      reason: form.reason, submitted: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date()),
      status: "Pending",
    };
    setRequests((current) => [request, ...current]);
    setForm(emptyForm);
    setSubmittedId(nextId);
  }

  function updateStatus(id: string, status: Status) {
    setRequests((current) => current.map((request) => request.id === id ? { ...request, status } : request));
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
          <button className={view === "admin" ? "active" : ""} onClick={() => setView("admin")}>Admin review <span className="countBadge">{counts.Pending}</span></button>
        </nav>
        <div className="user"><span>AW</span><div><b>Alex Wong</b><small>{view === "dealer" ? "Dealer partner" : "Program staff"}</small></div></div>
      </header>

      {view === "dealer" ? (
        <section className="dealerPage">
          <div className="pageIntro">
            <p className="eyebrow">DEALER PORTAL</p>
            <h1>Request permission<br />to sell to a school.</h1>
            <p>Tell us who you’re working with and what they need. Our school partnerships team will review your request.</p>
            <div className="steps">
              <div><span>1</span><b>Submit details</b><small>About 3 minutes</small></div>
              <div><span>2</span><b>Staff review</b><small>Usually 1–2 business days</small></div>
              <div><span>3</span><b>Get your decision</b><small>Recorded in this portal</small></div>
            </div>
            <aside><b>Need help?</b><p>Contact the partner team at <a href="mailto:partners@schoolsell.example">partners@schoolsell.example</a></p></aside>
          </div>

          <div className="formCard">
            {submittedId ? (
              <div className="success" role="status"><span>✓</span><p><b>Request submitted</b>Your reference number is {submittedId}. The request is now waiting for staff review.</p><button onClick={() => setSubmittedId("")}>Submit another request</button></div>
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
                  <label>Product<select required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}><option value="">Select a product</option><option>STEM Robotics Lab</option><option>Early Readers Collection</option><option>Chemistry Safety Kit</option><option>Math Foundations Suite</option><option>Classroom Audio System</option></select></label>
                  <label>Estimated quantity<input required min="1" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" /></label>
                </div>
                <label>Reason for request<textarea required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Share the school’s need, timeline, or program context." /></label></fieldset>
                <button className="primary" type="submit">Submit request <span>→</span></button>
                <p className="finePrint">By submitting, you confirm the information above is accurate.</p>
              </form>
            )}
          </div>
        </section>
      ) : (
        <section className="adminPage">
          <div className="adminHero"><div><p className="eyebrow">STAFF WORKSPACE</p><h1>Sales permission requests</h1><p>Review and respond to dealer requests from one place.</p></div><div className="stats"><div><span className="dot pending" /><b>{counts.Pending}</b><small>Pending</small></div><div><span className="dot approved" /><b>{counts.Approved}</b><small>Approved</small></div><div><span className="dot denied" /><b>{counts.Denied}</b><small>Denied</small></div></div></div>
          <div className="toolbar"><div className="filters">{(["All", "Pending", "Approved", "Denied"] as const).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}{item !== "All" && <span>{counts[item]}</span>}</button>)}</div><label className="search"><span>⌕</span><input aria-label="Search requests" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dealer, school, product…" /></label></div>
          <div className="requestList">
            <div className="listHeader"><span>Request</span><span>School & product</span><span>Submitted</span><span>Status</span><span>Decision</span></div>
            {visibleRequests.map((request) => <article className="requestRow" key={request.id}>
              <div className="requestMeta"><b>{request.id}</b><strong>{request.dealer}</strong><small>{request.email}</small></div>
              <div className="schoolMeta"><strong>{request.school}</strong><span>{request.district}</span><b>{request.product} · Qty {request.quantity}</b><p>{request.reason}</p></div>
              <time>{request.submitted}</time>
              <span className={`status ${request.status.toLowerCase()}`}><i />{request.status}</span>
              <div className="decisions"><button aria-label={`Approve ${request.id}`} className="approve" onClick={() => updateStatus(request.id, "Approved")}>✓</button><button aria-label={`Deny ${request.id}`} className="deny" onClick={() => updateStatus(request.id, "Denied")}>×</button></div>
            </article>)}
            {visibleRequests.length === 0 && <div className="empty"><b>No matching requests</b><span>Try a different status or search term.</span></div>}
          </div>
          <p className="localNote">Demo data is stored only in this browser. No server or account is required.</p>
        </section>
      )}
    </main>
  );
}
