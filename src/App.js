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
    const res = await fetch("http://localhost:5000/leads");
    const data = await res.json();
    setLeads(Array.isArray(data) ? data : []);
  };

  // ✅ Delete lead
  const deleteLead = async (id) => {
    const confirmDelete = window.confirm("Delete this lead?");
    if (!confirmDelete) return;

    await fetch(`http://localhost:5000/leads/${id}`, {
      method: "DELETE",
    });

    fetchLeads();
  };

  // 🔍 Search
  const handleSearch = async () => {
    setLoading(true);
    setVisibleCount(5);

    try {
      const res = await fetch("http://localhost:5000/scrape", {
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

  // 📄 Export CSV
  const exportCSV = () => {
    const headers = ["Website", "Email", "Phone", "Keyword", "Source"];

    const rows = leads.map((lead) => [
      lead.website,
      lead.email,
      lead.phone,
      lead.keyword,
      lead.source || "google",
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "leads.csv";
    link.click();
  };

  // 📧 Send Emails
  const sendEmails = async () => {
    const valid = leads.filter(
      (l) => l.email && l.email !== "Not found"
    );

    if (valid.length === 0) return alert("❌ No valid emails");

    await fetch("http://localhost:5000/send-emails", {
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

    await fetch("http://localhost:5000/follow-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ leads: valid }),
    });

    alert("🔁 Follow-up sent");
  };

  // ⭐ Status
  const getStatus = (lead) => {
    if (lead.email !== "Not found" && lead.phone !== "Not found") return "hot";
    if (lead.email !== "Not found") return "warm";
    return "cold";
  };

  // 🔍 Filtered leads
  const filteredLeads = leads.filter((lead) => {
    return (
      (sourceFilter === "all" || lead.source === sourceFilter) &&
      (lead.keyword || "").toLowerCase().includes(filter.toLowerCase())
    );
  });

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-6">🚀 Lead Tool</h2>

        <ul className="space-y-3">
          <li className="text-blue-600 font-semibold">Dashboard</li>
          <li>Leads</li>
          <li>Campaigns</li>
          <li>Settings</li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Upgrade
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <p>Total Leads</p>
            <h2 className="text-xl font-bold">{leads.length}</h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p>Valid Emails</p>
            <h2 className="text-xl font-bold">
              {leads.filter((l) => l.email !== "Not found").length}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p>Session Leads</p>
            <h2 className="text-xl font-bold">{sessionLeads.length}</h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p>Keyword</p>
            <h2 className="text-xl font-bold">{keyword || "—"}</h2>
          </div>
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-xl shadow mb-4 flex gap-2">
          <input
            className="flex-1 border p-2 rounded-lg"
            placeholder="Enter keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="google">Google</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="justdial">Justdial</option>
            <option value="indiamart">IndiaMART</option>
          </select>

          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {loading ? "⏳" : "Search"}
          </button>
        </div>

        {/* FILTER */}
        <input
          placeholder="Filter leads..."
          className="border p-2 rounded mb-4 w-full"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        {/* SOURCE FILTER */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", "google", "facebook", "instagram", "justdial", "indiamart"].map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`px-3 py-1 rounded text-sm ${
                sourceFilter === src
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {src}
            </button>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 mb-4">
          <button onClick={exportCSV} className="bg-gray-200 px-3 py-2 rounded-lg">
            📄 Export
          </button>

          <button onClick={sendEmails} className="bg-green-600 text-white px-3 py-2 rounded-lg">
            📧 Emails
          </button>

          <button onClick={sendFollowUp} className="bg-yellow-500 text-white px-3 py-2 rounded-lg">
            🔁 Follow-up
          </button>
        </div>

        {/* LEADS */}
        <div className="space-y-4">
          {filteredLeads.slice(0, visibleCount).map((lead, index) => (
            <div
              key={lead.id || lead.website || index}
              className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition flex justify-between items-center"
            >
              <div className="max-w-xl">
                <p className="font-semibold truncate">
                  {lead.title || lead.website}
                </p>

                <p className="text-xs text-blue-500 mb-1">
                  {lead.source || "google"}
                </p>

                <p className="text-sm text-gray-600">📧 {lead.email}</p>
                <p className="text-sm text-gray-600">📞 {lead.phone}</p>

                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded text-white ${
                  getStatus(lead) === "hot"
                    ? "bg-green-500"
                    : getStatus(lead) === "warm"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}>
                  {getStatus(lead)}
                </span>
              </div>

              {/* ✅ BUTTONS */}
              <div className="flex gap-2">
                <a href={lead.website} target="_blank" rel="noreferrer">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm rounded-md">
                    Visit
                  </button>
                </a>

                <button
                  onClick={() => deleteLead(lead.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* LOAD MORE */}
        {visibleCount < filteredLeads.length && (
          <button
            onClick={() => setVisibleCount(visibleCount + 5)}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}

export default App;