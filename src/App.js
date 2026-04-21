const BASE_URL = "https://lead-generation-tool.onrender.com";
import { useState, useEffect } from "react";

function App() {
  const [keyword, setKeyword] = useState("");
  const [leads, setLeads] = useState([]);
  const [sessionLeads, setSessionLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [source, setSource] = useState("google");

  useEffect(() => {
    fetchLeads();
  }, []);

  // ✅ Fetch leads
  const fetchLeads = async () => {
    const res = await fetch(`${BASE_URL}/leads`);
    const data = await res.json();
    setLeads(Array.isArray(data) ? data : []);
  };

  // ✅ Delete lead
  const deleteLead = async (id) => {
    const confirmDelete = window.confirm("Delete this lead?");
    if (!confirmDelete) return;

    await fetch(`${BASE_URL}/leads/${id}`, {
      method: "DELETE",
    });

    fetchLeads();
  };

  // 🔍 Search
  const handleSearch = async () => {
    setLoading(true);
    setVisibleCount(5);

    try {
      const res = await fetch(`${BASE_URL}/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword, source }),
      });

      const data = await res.json();

      const leadsData = Array.isArray(data)
        ? data
        : data.leads || [];

      setLeads(leadsData);
      setSessionLeads(leadsData);

    } catch (err) {
      console.error("❌ Error:", err);
      setLeads([]);
    }

    setLoading(false);
  };

  // 📧 Send Emails
  const sendEmails = async () => {
    const valid = leads.filter(
      (l) => l.email && l.email !== "Not found"
    );

    if (valid.length === 0) return alert("❌ No valid emails");

    await fetch(`${BASE_URL}/send-emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ leads: valid }),
    });

    alert(`✅ Sent ${valid.length} emails`);
  };

  // 🔁 Follow-up
  const sendFollowUp = async () => {
    const valid = leads.filter(
      (l) => l.email && l.email !== "Not found"
    );

    if (valid.length === 0) return alert("❌ No valid emails");

    await fetch(`${BASE_URL}/follow-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ leads: valid }),
    });

    alert("🔁 Follow-up sent");
  };

  return (
    // your UI remains SAME
  );
}

export default App;