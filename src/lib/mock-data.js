export const businesses = [
  { id: "biz-001", name: "Helios Trade Networks", industry: "Logistics & Supply Chain", location: "Mumbai, IN", trustScore: 85, kycStatus: "verified", registration: "U74999MH2018PLC312841", website: "helios-trade.com", gstin: "27AAACH1234A1Z9", pan: "AAACH1234A", founded: "2018", logo: "HT" },
  { id: "biz-002", name: "Vertex Industrial Co.", industry: "Manufacturing", location: "Pune, IN", trustScore: 62, kycStatus: "pending", registration: "U28999PN2020PLC189043", website: "vertex-industrial.in", gstin: "27AABCV5678B1Z3", pan: "AABCV5678B", founded: "2020", logo: "VI" },
  { id: "biz-003", name: "Northwind Capital Partners", industry: "Financial Services", location: "Bengaluru, IN", trustScore: 41, kycStatus: "rejected", registration: "U67100KA2021PTC145890", website: "northwind-cap.io", gstin: "29AABCN9012C1Z7", pan: "AABCN9012C", founded: "2021", logo: "NC" },
  { id: "biz-004", name: "Aurora Green Energy", industry: "Renewable Energy", location: "Hyderabad, IN", trustScore: 91, kycStatus: "verified", registration: "U40300TG2017PLC112233", website: "aurora-green.com", gstin: "36AABCA3344D1Z2", pan: "AABCA3344D", founded: "2017", logo: "AG" },
  { id: "biz-005", name: "Meridian Pharma Labs", industry: "Pharmaceuticals", location: "Ahmedabad, IN", trustScore: 78, kycStatus: "verified", registration: "U24239GJ2015PLC080921", website: "meridian-labs.co", gstin: "24AABCM5566E1Z8", pan: "AABCM5566E", founded: "2015", logo: "MP" },
  { id: "biz-006", name: "Quanta Cyber Systems", industry: "IT & Cybersecurity", location: "Gurugram, IN", trustScore: 73, kycStatus: "pending", registration: "U72200HR2019PTC078912", website: "quanta-cyber.io", gstin: "06AABCQ7788F1Z5", pan: "AABCQ7788F", founded: "2019", logo: "QC" },
];

export const kycDocuments = [
  { id: "doc-1", name: "GST_Certificate_2024.pdf", type: "GST Certificate", uploadedAt: "2025-09-12", expiresAt: "2026-09-11", status: "verified", extracted: { GSTIN: "27AAACH1234A1Z9", "Legal Name": "Helios Trade Networks Pvt Ltd", "Valid Until": "2026-09-11" } },
  { id: "doc-2", name: "PAN_Card.pdf", type: "PAN Card", uploadedAt: "2025-09-10", expiresAt: "2030-12-31", status: "verified", extracted: { PAN: "AAACH1234A", Name: "Helios Trade Networks Pvt Ltd" } },
  { id: "doc-3", name: "Incorporation_Cert.pdf", type: "Incorporation Certificate", uploadedAt: "2025-08-22", expiresAt: "2099-12-31", status: "verified" },
  { id: "doc-4", name: "Bank_Statement_Q3.pdf", type: "Bank Proof", uploadedAt: "2025-10-30", expiresAt: "2026-01-30", status: "pending" },
  { id: "doc-5", name: "Old_GST_Cert.pdf", type: "GST Certificate", uploadedAt: "2024-03-15", expiresAt: "2025-12-01", status: "rejected" },
];

export const deals = [
  { id: "DL-2841", name: "Q4 Component Supply Agreement", counterparty: "Vertex Industrial Co.", counterpartyId: "biz-002", value: 4_500_000, status: "active", createdAt: "2025-10-12", description: "Quarterly supply of precision-machined components." },
  { id: "DL-2840", name: "Solar Panel Procurement", counterparty: "Aurora Green Energy", counterpartyId: "biz-004", value: 12_800_000, status: "completed", createdAt: "2025-08-04", description: "1.2 MW solar farm equipment package." },
  { id: "DL-2839", name: "Cybersecurity Audit Engagement", counterparty: "Quanta Cyber Systems", counterpartyId: "biz-006", value: 850_000, status: "disputed", createdAt: "2025-09-25", description: "Full security audit and penetration testing." },
  { id: "DL-2838", name: "Pharma Distribution MOU", counterparty: "Meridian Pharma Labs", counterpartyId: "biz-005", value: 3_200_000, status: "draft", createdAt: "2025-11-02", description: "Multi-region distribution memorandum." },
];

export const riskFlags = [
  { id: "rf-1", title: "GSTIN inactive", description: "Counterparty GSTIN reported inactive on government registry as of last sync.", severity: "high", raisedAt: "2025-11-04" },
  { id: "rf-2", title: "Address mismatch", description: "Registered address differs from bank-issued statement.", severity: "medium", raisedAt: "2025-10-21" },
  { id: "rf-3", title: "Director name mismatch", description: "Minor name variance detected on PAN vs MCA records.", severity: "low", raisedAt: "2025-10-02" },
];

export const auditLogs = [
  { id: "L-1001", type: "Login", actor: "priya@helios-trade.com", target: "Web client", timestamp: "2025-11-09 09:14" },
  { id: "L-1002", type: "Document Upload", actor: "priya@helios-trade.com", target: "Bank_Statement_Q3.pdf", timestamp: "2025-11-09 09:21" },
  { id: "L-1003", type: "Deal Created", actor: "priya@helios-trade.com", target: "DL-2838", timestamp: "2025-11-09 10:05" },
  { id: "L-1004", type: "Profile View", actor: "ops@vertex-industrial.in", target: "Helios Trade Networks", timestamp: "2025-11-09 11:32" },
  { id: "L-1005", type: "Verification", actor: "admin@trustpilot.io", target: "GST_Certificate_2024.pdf", timestamp: "2025-11-09 12:48" },
  { id: "L-1006", type: "Score Updated", actor: "system", target: "Helios Trade Networks → 85", timestamp: "2025-11-09 13:00" },
  { id: "L-1007", type: "Profile View", actor: "buyer@meridian-labs.co", target: "Helios Trade Networks", timestamp: "2025-11-09 14:11" },
  { id: "L-1008", type: "Document Upload", actor: "ops@vertex-industrial.in", target: "Incorporation_Cert.pdf", timestamp: "2025-11-09 15:24" },
  { id: "L-1009", type: "Verification", actor: "admin@trustpilot.io", target: "Bank_Statement_Q3.pdf", timestamp: "2025-11-09 16:02" },
  { id: "L-1010", type: "Login", actor: "admin@trustpilot.io", target: "Admin console", timestamp: "2025-11-09 16:40" },
];

export const trustHistory = [
  { month: "Dec", score: 71 }, { month: "Jan", score: 73 }, { month: "Feb", score: 72 },
  { month: "Mar", score: 75 }, { month: "Apr", score: 78 }, { month: "May", score: 77 },
  { month: "Jun", score: 79 }, { month: "Jul", score: 81 }, { month: "Aug", score: 80 },
  { month: "Sep", score: 82 }, { month: "Oct", score: 84 }, { month: "Nov", score: 85 },
];

export const trustBreakdown = [
  { factor: "kycScore", weight: 40, score: 38, max: 40 },
  { factor: "complianceScore", weight: 20, score: 28, max: 20 },
  { factor: "dealPerformanceScore", weight: 30, score: 19, max: 30 },
  { factor: "activityScore", weight: 10, score: 0, max: 10 },
];

export const adminQueue = [
  { id: "q1", business: "Helios Renewables Ltd", document: "GST Certificate", uploadedAt: "2026-05-10", status: "Pending" },
  { id: "q2", business: "Quartz Trading Co.", document: "PAN Card", uploadedAt: "2026-05-10", status: "Pending" },
  { id: "q3", business: "Helios Renewables Ltd", document: "Incorporation", uploadedAt: "2026-05-09", status: "Pending" },
  { id: "q4", business: "Northwind Logistics", document: "Bank Statement", uploadedAt: "2026-05-09", status: "Pending" },
];

export const recentActivity = [
  { id: "r1", text: "Bank Statement uploaded — awaiting OCR", time: "12m ago", type: "upload" },
  { id: "r2", text: "Helios Renewables viewed your profile", time: "1h ago", type: "view" },
  { id: "r3", text: "Deal created: Quarterly Supply Agreement", time: "3h ago", type: "deal" },
  { id: "r4", text: "Trust score increased by +2 to 85", time: "Yesterday", type: "score" },
  { id: "r5", text: "GST Certificate re-verified by admin", time: "2 days ago", type: "verify" },
];

export const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
