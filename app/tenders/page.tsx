"use client";

import { useEffect, useState } from "react";

export default function TendersPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    value: "",
    startDate: "",
    endDate: "",
    status: "OPEN",
  });

  async function loadTenders() {
    const res = await fetch("/api/tenders");
    const data = await res.json();
    setTenders(data);
  }

  useEffect(() => {
    loadTenders();
  }, []);

  async function addTender(e: any) {
    e.preventDefault();

    await fetch("/api/tenders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({
      title: "",
      department: "",
      location: "",
      value: "",
      startDate: "",
      endDate: "",
      status: "OPEN",
    });

    loadTenders();
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tender Management</h1>

      <form onSubmit={addTender} className="grid gap-4 bg-white border rounded-xl p-5 mb-8">
        <h2 className="text-xl font-semibold">Add New Tender</h2>

        <input className="border p-3 rounded" placeholder="Tender Title"
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

        <input className="border p-3 rounded" placeholder="Department / Client"
          value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />

        <input className="border p-3 rounded" placeholder="Location"
          value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />

        <input className="border p-3 rounded" placeholder="Estimated Value"
          value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />

        <label>Start Date</label>
        <input className="border p-3 rounded" type="date"
          value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />

        <label>End Date</label>
        <input className="border p-3 rounded" type="date"
          value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />

        <select className="border p-3 rounded"
          value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="OPEN">OPEN</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="WON">WON</option>
          <option value="LOST">LOST</option>
        </select>

        <button className="bg-black text-white p-3 rounded font-semibold">
          Save Tender
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-4">Tender List</h2>

      <div className="grid gap-3">
        {tenders.map((tender) => (
          <div key={tender.id} className="border rounded-xl p-4 bg-white">
            <h3 className="font-bold text-lg">{tender.title}</h3>
            <p>{tender.department} - {tender.location}</p>
            <p>Status: {tender.status}</p>
            <p>Closing: {new Date(tender.endDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </main>
  );
}