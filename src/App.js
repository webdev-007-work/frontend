import { useState, useEffect } from "react";


const BASE_URL = "https://lead-generation-tool.onrender.com";

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

  // ✅ FETCH FROM BACKEND
  const fetchLeads = async () => {
    const res = await fetch(`${BASE_URL}/leads`);
    const data = await res.json();
    setLeads(Array.isArray(data) ? data : []);
  };

  // ✅ DELETE
  const deleteLead = async (id) => {
    const confirmDelete = window.confirm("Delete this lead?");
    if (!confirmDelete) return;

    await fetch(`${BASE_URL}/leads/${id}`, {
      method: "DELETE",
    });

    fetchLeads();
  };

  // 🔍 SEARCH
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

  // 📄 EXPORT
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

  // 📧 SEND EMAILS
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

  // 🔁 FOLLOW-UP
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

  // ⭐ STATUS
  const getStatus = (lead) => {
    if (lead.email !== "Not found" && lead.phone !== "Not found") return "hot";
    if (lead.email !== "Not found") return "warm";
    return "cold";
  };

  // 🔍 FILTER
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

        {/* LEADS */}
        <div className="space-y-4">
          {filteredLeads.slice(0, visibleCount).map((lead, index) => (
            <div
              key={lead.id || lead.website || index}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {lead.title || lead.website}
                </p>

                <p className="text-xs text-blue-500">
                  {lead.source || "google"}
                </p>

                <p className="text-sm text-gray-600">📧 {lead.email}</p>
                <p className="text-sm text-gray-600">📞 {lead.phone}</p>
              </div>

              {/* ✅ SAME SIZE BUTTONS */}
              <div className="flex gap-2">
                <a href={lead.website} target="_blank" rel="noreferrer">
                  <button className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md">
                    Visit
                  </button>
                </a>

                <button
                  onClick={() => deleteLead(lead.id)}
                  className="bg-red-500 text-white px-3 py-1 text-sm rounded-md"
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