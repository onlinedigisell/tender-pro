"use client";

import { useEffect, useState } from "react";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    status: "PENDING",
  });

  async function loadActivities() {
    const res = await fetch("/api/activities");
    const data = await res.json();
    setActivities(data);
  }

  useEffect(() => {
    loadActivities();
  }, []);

  async function addActivity(e: any) {
    e.preventDefault();

    await fetch("/api/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({
      title: "",
      date: "",
      status: "PENDING",
    });

    loadActivities();
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Daily Activity Manager</h1>

      <form onSubmit={addActivity} className="grid gap-4 bg-white border rounded-xl p-5 mb-8">
        <h2 className="text-xl font-semibold">Add Activity</h2>

        <input
          className="border p-3 rounded"
          placeholder="Activity Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <label>Activity Date</label>
        <input
          className="border p-3 rounded"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />

        <select
          className="border p-3 rounded"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="PENDING">PENDING</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>

        <button className="bg-black text-white p-3 rounded font-semibold">
          Save Activity
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-4">Activity List</h2>

      <div className="grid gap-3">
        {activities.map((activity) => (
          <div key={activity.id} className="border rounded-xl p-4 bg-white">
            <h3 className="font-bold text-lg">{activity.title}</h3>
            <p>Date: {new Date(activity.date).toLocaleDateString()}</p>
            <p>Status: {activity.status}</p>
          </div>
        ))}
      </div>
    </main>
  );
}