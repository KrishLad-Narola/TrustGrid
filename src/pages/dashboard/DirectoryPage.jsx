import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, StatusBadge } from "@/components/ui-bits";
import { Search, MapPin, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "@/API/axiosInstance";

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("All");
  const [scoreMin, setScoreMin] = useState(0);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    axiosInstance.post("/businesses/counterparties", {})
      .then((res) => {
        if (!isMounted) return;

        const resData = res?.data;
        if (resData && Array.isArray(resData.data)) {
          setBusinesses(resData.data);
        } else if (resData && resData.data && Array.isArray(resData.data.data)) {
          setBusinesses(resData.data.data);
        } else if (Array.isArray(resData)) {
          setBusinesses(resData);
        } else {
          console.error("API Response Structure Error:", resData);
          throw new Error("Invalid structure returned from server (Expected an array)");
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Fetch Exception Logs:", err);
        
        const errMsg = err?.response?.data?.message 
          || (err?.response?.status === 401 ? "Unauthorized access (401). Your session may have expired." : null)
          || err.message 
          || "An unexpected error occurred while fetching data.";
          
        setError(errMsg);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, industry, scoreMin]);

  const industries = [
    "All",
    ...new Set(businesses.map((b) => b.industry).filter(Boolean)),
  ];

  const filtered = businesses.filter((b) => {
    const displayName = b.tradeName || b.legalName || b.basicInfo?.tradeName || "Unknown Business";
    const businessIndustry = b.industry || b.basicInfo?.industry || "";
    const overallScore = typeof b.trustScore === "object" ? (b.trustScore?.overall || 0) : (b.trustScore || 0);

    const matchesIndustry = industry === "All" || businessIndustry.toLowerCase() === industry.toLowerCase();
    const matchesScore = overallScore >= scoreMin;
    const matchesSearch =
      displayName.toLowerCase().includes(q.toLowerCase()) ||
      businessIndustry.toLowerCase().includes(q.toLowerCase());

    return matchesIndustry && matchesScore && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const scoreColor = (s) =>
    s >= 75 ? "text-success" : s >= 55 ? "text-warning" : "text-destructive";

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] justify-between gap-6 pb-2">
      <div className="flex-1">
        <Card>
          <div className="grid md:grid-cols-4 gap-3">
            <div className="md:col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-input border border-border">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by BusinessName"
                className="bg-transparent text-sm outline-none flex-1"
              />
            </div>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="px-3 py-2 rounded-lg bg-input cursor-pointer border border-border text-sm outline-none"
            >
              {industries.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-input border border-border">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Min Trust</span>
              <input
                type="range"
                min={0}
                max={100}
                value={scoreMin}
                onChange={(e) => setScoreMin(+e.target.value)}
                className="flex-1 accent-primary cursor-pointer"
              />
              <span className="font-mono text-xs w-7 text-right">{scoreMin}</span>
            </div>
          </div>
        </Card>

        {/* Conditional UI Layout States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            <span>Loading verified directory records...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center border border-dashed border-destructive/30 rounded-xl bg-destructive/5 mt-4">
            <p className="text-sm font-semibold text-destructive mb-1">Authentication or Network issue</p>
            <p className="text-xs text-muted-foreground max-w-md mb-4">{error}</p>
            <p className="text-xs text-muted-foreground mb-4">
              If you see an unauthorized message, make sure you are logged in so a valid token is present in your local browser storage.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 text-xs bg-destructive text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Retry Connection
            </button>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-xl mt-4">
            No records found matching your specified filter options.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {currentItems.map((b) => {
              const displayName = b.tradeName || b.legalName || b.basicInfo?.tradeName || "Unknown Business";
              const businessIndustry = b.industry || b.basicInfo?.industry || "N/A";
              const overallScore = typeof b.trustScore === "object" ? (b.trustScore?.overall || 0) : (b.trustScore || 0);
              const displayLocation = b.registeredAddress?.city || b.basicInfo?.city || "India";
              
              const initials = displayName ? displayName.split(" ")[0].slice(0, 2).toUpperCase() : "BI";

              return (
                <Card key={b._id} className="flex flex-col hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="size-12 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-display font-bold flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{displayName}</div>
                      <div className="text-xs text-muted-foreground">{businessIndustry}</div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                        <MapPin className="size-3 shrink-0" /> {displayLocation}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Trust Score
                      </div>
                      <div className={`font-mono text-2xl font-semibold ${scoreColor(overallScore)}`}>
                        {overallScore}
                      </div>
                    </div>
                    <StatusBadge status={b.kycStatus} />
                  </div>
                  <Link
                    to={`/profile/${b._id}`}
                    className="btn-primary w-full justify-center text-xs mt-auto flex items-center gap-1 border border-border py-2 rounded-lg transition-colors"
                  >
                    View profile <ArrowUpRight className="size-3.5" />
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Synchronized Pagination Navigation Line */}
      {!loading && !error && currentItems.length > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filtered.length)}
            </span>{" "}
            of <span className="font-medium">{filtered.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-border rounded-md bg-input disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-accent/5"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs font-medium px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-border rounded-md bg-input disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-accent/5"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}