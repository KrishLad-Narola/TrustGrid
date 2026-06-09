import { useEffect, useMemo, useState, useCallback } from "react";
import axiosInstance from "@/API/axiosInstance";
import { formatINR } from "@/lib/mock-data";
import { toast } from "sonner";

import {
  Plus,
  Handshake,
  TrendingUp,
  CheckCircle2,
  AlertOctagon,
  Pencil,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  AlertTriangle,
  BadgeCheck,
  X,
  Clock,
  Calendar,
  FileText,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { de } from "date-fns/locale/de";

const mapStatus = (status) => {
  const map = {
    PENDING_ACCEPTANCE: "pending",
    ACTIVE: "active",
    COMPLETED: "completed",
    DISPUTED: "disputed",
    RESOLVED: "resolved",
    REJECTED: "rejected",
    CANCELLED: "cancelled",
  };
  return map[status] ?? "active";
};

const normalizeDeal = (deal) => {
  const rawCounterparty =
    deal.counterPartyBusinessId ?? deal.counterPartyBusiness ?? deal.counterparty;
  const rawCreator = deal.createdByBusinessId ?? deal.createdByBusiness;

  return {
    id: deal._id,
    name: deal.title,
    description: deal.description,
    value: deal.value,
    referenceNumber: deal.referenceNumber,
    createdByBusiness: rawCreator,
    counterparty: rawCounterparty,
    status: mapStatus(deal.status),
    initiatorCompletedAt: deal.initiatorCompletedAt,
    counterPartyCompletedAt: deal.counterPartyCompletedAt,

    createdAt: new Date(deal.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),

    rawDeadline: deal.dealTimeline || deal.endDate || null,

    deadline: deal.dealTimeline
      ? new Date(deal.dealTimeline).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : deal.endDate
        ? new Date(deal.endDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : null,

    canAccept: deal.canAccept,
    canReject: deal.canReject,
    canCancel: deal.canCancel,

    disputeReason: deal.disputeReason,
    disputeRaisedBy: deal.disputeRaisedBy,
    disputeId: deal.disputeId,

    timeline: deal.timeline || deal.dealTimeline || [],
  };
};

const getCompletionState = (deal, business) => {
  if (deal.initiatorCompletedAt && deal.counterPartyCompletedAt) return "both_completed";
  const creatorId = deal.createdByBusiness?._id || deal.createdByBusiness;
  if (deal.initiatorCompletedAt && creatorId == business?._id) return "user_completed";
  if (deal.counterPartyCompletedAt) return "waiting_completion";
  return "not_started";
};

function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft("Expired / Deadline Passed");
        setIsExpired(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      let parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(`${parts.join(" ")} remaining`);
      setIsExpired(false);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <p className={`text-sm font-medium ${isExpired ? "text-rose-500" : "text-amber-600"}`}>
      {timeLeft}
    </p>
  );
}

export default function DealsPage() {
  const [activeTab, setActiveTab] = useState("incoming");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    incomingDeals: 0,
    disputedDeals: 0,
    activeDeals: 0,
    completedDeals: 0,
  });
  const [open, setOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [disputingDeal, setDisputingDeal] = useState(null);
  const [resolvingDeal, setResolvingDeal] = useState(null);
  const [viewingDeal, setViewingDeal] = useState(null);
  const [counterparties, setCounterparties] = useState([]);

  const tabs = [
    { key: "incoming", label: "Incoming" },
    { key: "sent", label: "Sent" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "disputed", label: "Disputed" },
  ];

  const { business } = useAuth();

  const loadDeals = useCallback(
    async (type = activeTab) => {
      try {
        setLoading(true);

        if (type === "disputed") {
          const res = await axiosInstance.get("/deals/disputes");

          const disputeRecords = res?.data?.data || res?.data || [];

          const mappedDeals = disputeRecords.map((record) => {
            const underlyingDeal = record.dealId || {};
            return normalizeDeal({
              ...underlyingDeal,
              disputeId: record._id,
              status: record.status === "RESOLVED" ? "RESOLVED" : "DISPUTED",
              disputeReason: record.reason,
              disputeRaisedBy: record.raisedByBusinessId?._id || record.raisedByBusinessId,
            });
          });

          setDeals(mappedDeals);
          setSummary((prev) => ({
            ...prev,
            disputedDeals: mappedDeals.filter((d) => d.status === "disputed").length,
          }));
        } else {
          const res = await axiosInstance.get(`/deals?type=${type}`);

          setDeals((res?.data?.deals || []).map(normalizeDeal));

          if (res?.data?.summary) {
            setSummary(res.data.summary);
          }
        }
      } catch (err) {
        console.error(err);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    },
    [activeTab],
  );

  const loadCounterparties = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/businesses/counterparties");
      setCounterparties(res?.businesses || res?.data?.businesses || res?.data || []);
    } catch {}
  }, []);

  const loadDealById = async (id) => {
    try {
      const res = await axiosInstance.get(`/deals/${id}`);

      const dealData = res?.data?.data?.deal || res?.data?.deal || res?.deal;

      const timelineData = res?.data?.data?.dealTimeline || res?.data?.dealTimeline || [];

      if (!dealData) return null;

      return normalizeDeal({
        ...dealData,
        timeline: timelineData,
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    loadDeals(activeTab);
  }, [activeTab, loadDeals]);
  useEffect(() => {
    loadCounterparties();
  }, [loadCounterparties]);

  const loadSummary = async () => {
    try {
      const [summaryRes, disputeRes] = await Promise.all([
        axiosInstance.get("/deals?type=incoming"),
        axiosInstance.get("/deals/disputes"),
      ]);

      const summaryData = summaryRes?.data?.summary || {};

      const disputes = disputeRes?.data?.data || disputeRes?.data || [];

      setSummary({
        incomingDeals: summaryData.incomingDeals || 0,
        activeDeals: summaryData.activeDeals || 0,
        completedDeals: summaryData.completedDeals || 0,
        disputedDeals: disputes.length,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleCreateDeal = async (payload) => {
    try {
      await axiosInstance.post("/deals", {
        title: payload.name,
        counterPartyBusinessId: payload.counterparty,
        value: Number(payload.value),
        description: payload.description,
      });
      await loadDeals();
      setOpen(false);
      toast.success("Deal created successfully");
    } catch {}
  };

  const handleUpdateDeal = async (updatedDeal) => {
    try {
      await axiosInstance.patch(`/deals/${updatedDeal.id}`, {
        title: updatedDeal.name,
        value: Number(updatedDeal.value),
        description: updatedDeal.description,
      });
      await loadDeals();
      setEditingDeal(null);
      toast.success("Deal updated successfully");
    } catch {}
  };

  const handleDeleteDeal = async (id) => {
    if (!window.confirm("Delete this deal?")) return;
    try {
      await axiosInstance.delete(`/deals/${id}`);
      await loadDeals();
      toast.success("Deal deleted successfully");
    } catch {}
  };

  const handleAcceptDeal = async (id) => {
    try {
      await axiosInstance.patch(`/deals/${id}/accept`);
      await loadDeals();
      toast.success("Deal accepted");
    } catch {}
  };

  const handleRejectDeal = async (id) => {
    try {
      await axiosInstance.patch(`/deals/${id}/reject`);
      await loadDeals();
      toast.success("Deal rejected");
    } catch {}
  };

  const handleCancelDeal = async (id) => {
    if (!id) return toast.error("Invalid deal ID");
    try {
      await axiosInstance.patch(`/deals/${id}/cancel`);
      await loadDeals();
      toast.success("Deal cancelled successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel deal");
    }
  };

  const handleComplete = async (id) => {
    if (!id) return toast.error("Invalid deal ID");
    try {
      await axiosInstance.patch(`/deals/${id}/complete`);
      await loadDeals();
      toast.success("Deal completed successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to complete deal");
    }
  };
  const handleDisputeDeal = async (id, reason) => {
    if (!id) return toast.error("Invalid deal ID");

    try {
      await axiosInstance.post(`/deals/${id}/disputes`, {
        reason,
      });

      await loadDeals();
      await loadSummary();

      setDisputingDeal(null);

      toast.success("Dispute raised successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to raise dispute");
    }
  };

  const handleResolveDispute = async (id, resolutionNote) => {
    if (!id) return toast.error("Invalid deal ID");

    try {
      await axiosInstance.post(`/deals/disputes/${id}/resolve`, { resolutionNote });

      await loadDeals();
      await loadSummary();

      setResolvingDeal(null);

      toast.success("Dispute resolved successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resolve dispute");
    }
  };

  useEffect(() => {
    loadSummary();
  }, [deals]);

  const openEditModal = async (id) => {
    const deal = await loadDealById(id);
    if (deal) setEditingDeal(deal);
  };

  const openViewModal = async (id) => {
    const deal = await loadDealById(id);
    if (deal) {
      setViewingDeal(deal);
    } else {
      toast.error("Failed to load deal details");
    }
  };

  const dealStats = useMemo(
    () => ({
      incoming: summary.incomingDeals,
      active: summary.activeDeals,
      completed: summary.completedDeals,
      disputed: summary.disputedDeals,
    }),
    [summary],
  );

  return (
    <>
      <div className="flex justify-end">
        <button type="button" onClick={() => setOpen(true)} className="btn-primary cursor-pointer">
          <Plus className="size-4" />
          New Deal
        </button>
      </div>

      <div className="grid grid-cols-2  lg:grid-cols-4 gap-3">
        <StatCard icon={Handshake} label="Incoming" value={dealStats.incoming} color="blue" />
        <StatCard icon={TrendingUp} label="Active" value={dealStats.active} color="violet" />
        <StatCard icon={CheckCircle2} label="Completed" value={dealStats.completed} color="green" />
        <StatCard icon={AlertOctagon} label="Disputed" value={dealStats.disputed} color="red" />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 w-fit border border-slate-200 ">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`
                relative px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer
                ${
                  activeTab === tab.key
                    ? "btn-primary text-white shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200 border border-transparent"
                }
                ${
                  tab.key === "disputed" && activeTab !== "disputed"
                    ? "text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    : ""
                }
                ${
                  tab.key === "disputed" && activeTab === "disputed"
                    ? "bg-rose-50 text-rose-700 shadow-sm border border-rose-200"
                    : ""
                }
              `}
          >
            {tab.label}
            {tab.key === "disputed" && dealStats.disputed > 0 && activeTab !== "disputed" && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {dealStats.disputed > 9 ? "9+" : dealStats.disputed}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Deal List ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-white border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <EmptyState tab={activeTab} onNew={() => setOpen(true)} />
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              activeTab={activeTab}
              onAccept={handleAcceptDeal}
              onReject={handleRejectDeal}
              onCancel={handleCancelDeal}
              onEdit={openEditModal}
              onView={openViewModal}
              onDelete={handleDeleteDeal}
              onComplete={handleComplete}
              onDispute={(deal) => setDisputingDeal(deal)}
              onResolve={(deal) => setResolvingDeal(deal)}
              business={business}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {open && (
        <CreateDealModal
          counterparties={counterparties}
          onClose={() => setOpen(false)}
          onCreate={handleCreateDeal}
        />
      )}
      {editingDeal && (
        <EditDealModal
          deal={editingDeal}
          onClose={() => setEditingDeal(null)}
          onSave={handleUpdateDeal}
        />
      )}
      {disputingDeal && (
        <DisputeDealModal
          deal={disputingDeal}
          onClose={() => setDisputingDeal(null)}
          onSubmit={handleDisputeDeal}
        />
      )}
      {resolvingDeal && (
        <ResolveDisputeModal
          deal={resolvingDeal}
          onClose={() => setResolvingDeal(null)}
          onSubmit={handleResolveDispute}
        />
      )}
      {viewingDeal && <ViewDealModal deal={viewingDeal} onClose={() => setViewingDeal(null)} />}
    </>
  );
}

function DealCard({
  deal,
  activeTab,
  onAccept,
  onReject,
  onCancel,
  onEdit,
  onView,
  onDelete,
  onComplete,
  onDispute,
  onResolve,
  business,
}) {
  const completionState = activeTab === "active" ? getCompletionState(deal, business) : null;
  const cpName = deal.counterparty?.tradeName || deal.counterparty?.legalName || "—";

  return (
    <div
      className={`bg-white rounded-xl border hover:shadow-sm transition-all duration-200 ${
        activeTab === "disputed"
          ? "border-rose-200 hover:border-rose-300"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4 p-4 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{deal.name}</h3>
            <StatusBadge status={deal.status} />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
            <span className="font-mono">{deal.referenceNumber}</span>
            <Dot />
            <span>{cpName}</span>
            <Dot />
            <span>{deal.createdAt}</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs text-slate-400 mb-0.5">Deal value</p>
          <p className="text-base font-bold text-slate-900">{formatINR(deal.value)}</p>
        </div>
      </div>

      {deal.description && (
        <p className="text-xs text-slate-500 line-clamp-2 px-4 pb-3 leading-relaxed">
          {deal.description}
        </p>
      )}

      {deal.status === "disputed" && deal.disputeReason && (
        <DisputeBanner reason={deal.disputeReason} />
      )}

      {activeTab === "active" &&
        completionState !== "not_started" &&
        deal.status !== "disputed" && <CompletionBanner state={completionState} />}

      <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-end gap-2">
        <DealActions
          activeTab={activeTab}
          deal={deal}
          completionState={completionState}
          business={business}
          onAccept={onAccept}
          onReject={onReject}
          onCancel={onCancel}
          onEdit={onEdit}
          onView={onView}
          onDelete={onDelete}
          onComplete={onComplete}
          onDispute={onDispute}
          onResolve={onResolve}
        />
      </div>
    </div>
  );
}

function DisputeBanner({ reason }) {
  return (
    <div className="mx-4 mb-3 flex items-start gap-2 px-3 py-2.5 rounded-lg border border-rose-100 bg-rose-50">
      <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-wide mb-0.5">
          Dispute Raised
        </p>
        <p className="text-xs text-rose-700 leading-relaxed">{reason}</p>
      </div>
    </div>
  );
}

function CompletionBanner({ state }) {
  const configs = {
    user_completed: {
      bg: "bg-amber-50 border-amber-100",
      text: "text-amber-700",
      icon: <Clock className="h-3.5 w-3.5 shrink-0" />,
      msg: "You marked this complete — waiting for counterparty confirmation.",
    },
    waiting_completion: {
      bg: "bg-blue-50 border-blue-100",
      text: "text-blue-700",
      icon: <Clock className="h-3.5 w-3.5 shrink-0" />,
      msg: "Counterparty marked complete — your confirmation needed.",
    },
    both_completed: {
      bg: "bg-emerald-50 border-emerald-100",
      text: "text-emerald-700",
      icon: <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />,
      msg: "Both parties confirmed — mutual agreement reached.",
    },
  };
  const c = configs[state];
  if (!c) return null;
  return (
    <div
      className={`mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${c.bg} ${c.text}`}
    >
      {c.icon}
      {c.msg}
    </div>
  );
}

function DealActions({
  activeTab,
  deal,
  completionState,
  business,
  onAccept,
  onReject,
  onCancel,
  onEdit,
  onView,
  onDelete,
  onComplete,
  onDispute,
  onResolve,
}) {
  const isDisputed = deal.status === "disputed";
  const raisedByMe = deal.disputeRaisedBy === business?._id;

  if (deal.status === "cancelled" || deal.status === "rejected") {
    return (
      <>
        <Btn variant="ghost" icon={ExternalLink} onClick={() => onView(deal.id)}>
          View
        </Btn>
        <span className="text-xs font-medium text-slate-400 border border-slate-200 bg-slate-50 px-2 py-1 rounded-md capitalize">
          {deal.status}
        </span>
      </>
    );
  }

  if (activeTab === "incoming") {
    return (
      <>
        <Btn
          variant="ghost"
          icon={ExternalLink}
          onClick={() => onView(deal.id)}
          className="cursor-pointer"
        >
          View
        </Btn>
        <Btn variant="ghost-danger" icon={ThumbsDown} onClick={() => onReject(deal.id)}>
          Reject
        </Btn>
        <Btn variant="solid-success" icon={ThumbsUp} onClick={() => onAccept(deal.id)}>
          Accept
        </Btn>
      </>
    );
  }

  if (activeTab === "sent") {
    return (
      <>
        <Btn
          variant="ghost"
          icon={ExternalLink}
          onClick={() => onView(deal.id)}
          className="cursor-pointer"
        >
          View
        </Btn>
        <Btn
          variant="ghost"
          icon={Pencil}
          onClick={() => onEdit(deal.id)}
          className="cursor-pointer"
        >
          Edit
        </Btn>
        <Btn
          variant="ghost-danger"
          icon={XCircle}
          onClick={() => onCancel(deal.id)}
          className="cursor-pointer"
        >
          Cancel
        </Btn>
      </>
    );
  }

  if (activeTab === "active") {
    return (
      <>
        <Btn
          variant="ghost"
          icon={ExternalLink}
          onClick={() => onView(deal.id)}
          className="cursor-pointer"
        >
          View
        </Btn>

        {!isDisputed && (
          <Btn variant="ghost-danger" icon={AlertTriangle} onClick={() => onDispute(deal)}>
            Dispute
          </Btn>
        )}
        {isDisputed && raisedByMe && (
          <Btn variant="ghost-danger" icon={AlertTriangle} disabled>
            Disputed
          </Btn>
        )}
        {isDisputed && !raisedByMe && (
          <Btn variant="solid-success" icon={BadgeCheck} onClick={() => onResolve(deal)}>
            Resolve
          </Btn>
        )}

        {!isDisputed && completionState === "not_started" && (
          <Btn variant="solid-success" icon={BadgeCheck} onClick={() => onComplete(deal.id)}>
            Mark Complete
          </Btn>
        )}
        {!isDisputed && completionState === "user_completed" && (
          <Btn variant="ghost" disabled>
            Awaiting confirmation
          </Btn>
        )}
        {!isDisputed && completionState === "waiting_completion" && (
          <Btn variant="solid-success" icon={BadgeCheck} onClick={() => onComplete(deal.id)}>
            Confirm Complete
          </Btn>
        )}
        {completionState === "both_completed" && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Finalized
          </span>
        )}
      </>
    );
  }

  if (activeTab === "completed") {
    return (
      <>
        <Btn variant="ghost" icon={ExternalLink} onClick={() => onView(deal.id)}>
          View
        </Btn>
        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
        </span>
      </>
    );
  }

  if (activeTab === "disputed") {
    return (
      <>
        <Btn variant="ghost" icon={ExternalLink} onClick={() => onView(deal.id)}>
          View
        </Btn>

        {deal.status === "resolved" ? (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
          </span>
        ) : raisedByMe ? (
          <Btn variant="ghost-danger" icon={AlertTriangle} disabled>
            Dispute Raised
          </Btn>
        ) : (
          <Btn variant="solid-success" icon={BadgeCheck} onClick={() => onResolve(deal)}>
            Resolve Dispute
          </Btn>
        )}
      </>
    );
  }

  return null;
}

function Btn({ children, icon: Icon, variant = "ghost", onClick, disabled }) {
  const base =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    "ghost-danger": "bg-rose-50 text-rose-600 hover:bg-rose-100",
    "solid-success": "bg-emerald-600 text-white hover:bg-emerald-700",
  };
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    active: "bg-blue-50 text-blue-700 ring-blue-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    disputed: "bg-red-50 text-red-700 ring-red-200",
    resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    cancelled: "bg-slate-100 text-slate-500 ring-slate-200",
  };
  const labels = {
    pending: "Pending Acceptance",
    active: "Active",
    completed: "Completed",
    disputed: "Disputed",
    resolved: "Resolved",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${styles[status] ?? "bg-slate-100 text-slate-500 ring-slate-200"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: { bg: "bg-blue-50", icon: "text-blue-500", num: "text-blue-700" },
    violet: { bg: "bg-violet-50", icon: "text-violet-500", num: "text-violet-700" },
    green: { bg: "bg-emerald-50", icon: "text-emerald-500", num: "text-emerald-700" },
    red: { bg: "bg-red-50", icon: "text-red-500", num: "text-red-700" },
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`h-8 w-8 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
        <Icon className={`h-4 w-4 ${c.icon}`} />
      </div>
      <p className={`text-2xl font-bold ${c.num}`}>{value ?? 0}</p>
      <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
    </div>
  );
}

function EmptyState({ tab, onNew }) {
  const configs = {
    disputed: {
      icon: <AlertOctagon className="h-6 w-6 text-slate-400" />,
      title: "No disputed deals",
      desc: "All clear — no disputes have been raised.",
    },
    default: {
      icon: <Handshake className="h-6 w-6 text-slate-400" />,
      title: `No ${tab} deals`,
      desc: "Nothing here yet.",
    },
  };
  const cfg = configs[tab] ?? configs.default;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        {cfg.icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{cfg.title}</h3>
      <p className="text-xs text-slate-400 mb-4">{cfg.desc}</p>
      {tab === "sent" && (
        <button
          type="button"
          onClick={onNew}
          className="btn-primary cursor-pointer text-sm py-2 px-3"
        >
          <Plus className="h-3.5 w-3.5 " /> Create a deal
        </button>
      )}
    </div>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />;
}

function Modal({ children, onClose, title, subtitle }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-mono">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-lg hover:bg-slate-100 flex cursor-pointer items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition disabled:opacity-50 disabled:bg-slate-100";
const textareaCls =
  "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition resize-none";

// ─── Input Form Component ───────────────────────────────────────────────────
function Input({ label, ...props }) {
  return (
    <Field label={label}>
      <input className={inputCls} {...props} />
    </Field>
  );
}

function Select({ label, options, ...props }) {
  return (
    <Field label={label}>
      <select className={inputCls} {...props}>
        <option value="">Select counterparty</option>
        {options.map((cp) => (
          <option key={cp._id} value={cp._id}>
            {cp.tradeName || cp.legalName}
          </option>
        ))}
      </select>
    </Field>
  );
}

function CreateDealModal({ counterparties, onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", counterparty: "", value: "", description: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal title="New Deal" subtitle="Create a business agreement" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onCreate(form);
        }}
        className="space-y-4"
      >
        <Input
          label="Deal title"
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Q3 Supply Agreement"
        />
        <Select
          label="Counterparty"
          options={counterparties}
          value={form.counterparty}
          onChange={set("counterparty")}
        />
        <Input
          label="Deal value (₹)"
          type="number"
          value={form.value}
          onChange={set("value")}
          placeholder="0"
        />
        <Input
          label="Description"
          value={form.description}
          onChange={set("description")}
          placeholder="Brief terms or notes…"
        />
        <div className="pt-1">
          <button
            type="submit"
            className="w-full h-10 rounded-lg btn-primary cursor-pointer text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            Create Deal
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditDealModal({ deal, onClose, onSave }) {
  const [form, setForm] = useState(deal);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal title="Edit Deal" subtitle={deal.referenceNumber} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
        className="space-y-4"
      >
        <Input label="Deal title" value={form.name} onChange={set("name")} />
        <Input
          label="Counterparty"
          value={form.counterparty?.tradeName || form.counterparty?.legalName}
          disabled
        />
        <Input label="Deal value (₹)" type="number" value={form.value} onChange={set("value")} />
        <Input label="Description" value={form.description} onChange={set("description")} />
        <div className="pt-1">
          <button
            type="submit"
            className="w-full h-10 rounded-lg btn-primary cursor-pointer text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DisputeDealModal({ deal, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Please enter a dispute reason");
    setLoading(true);
    await onSubmit(deal.id, reason.trim());
    setLoading(false);
  };

  return (
    <Modal title="Raise a Dispute" subtitle={deal.referenceNumber} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Deal</span>
            <span className="font-medium text-slate-700">{deal.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Value</span>
            <span className="font-medium text-slate-700">{formatINR(deal.value)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Counterparty</span>
            <span className="font-medium text-slate-700">
              {deal.counterparty?.tradeName || deal.counterparty?.legalName || "—"}
            </span>
          </div>
        </div>

        <Field label="Reason for dispute">
          <textarea
            className={textareaCls}
            rows={4}
            placeholder="Describe the issue clearly — e.g. payment not received, goods not delivered as agreed…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </Field>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !reason.trim()}
            className="flex-1 h-10 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting…" : "Raise Dispute"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ResolveDisputeModal({ deal, onClose, onSubmit }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return toast.error("Please enter a resolution note");
    setLoading(true);
    await onSubmit(deal.disputeId, note.trim());
    setLoading(false);
  };

  return (
    <Modal title="Resolve Dispute" subtitle={deal.referenceNumber} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {deal.disputeReason && (
          <div className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-2.5 text-xs space-y-1">
            <p className="text-rose-500 font-semibold uppercase tracking-wide">Dispute Reason</p>
            <p className="text-rose-700 leading-relaxed">{deal.disputeReason}</p>
          </div>
        )}

        <div className="bg-slate-50 rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Deal</span>
            <span className="font-medium text-slate-700">{deal.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Value</span>
            <span className="font-medium text-slate-700">{formatINR(deal.value)}</span>
          </div>
        </div>

        <Field label="Resolution note">
          <textarea
            className={textareaCls}
            rows={4}
            placeholder="Explain how the issue was resolved or your counter-response…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </Field>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !note.trim()}
            className="flex-1 h-10 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resolving…" : "Mark Resolved"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── View Deal Timeline Modal (With Real-Time Deadlines) ────────────────────
function ViewDealModal({ deal, onClose }) {
  const counterpartyName =
    deal.counterparty?.tradeName || deal.counterparty?.legalName || deal.counterparty || "—";

  return (
    <Modal title="Deal Details" subtitle={deal.referenceNumber} onClose={onClose}>
      <div className="space-y-5">
        {/* Deal Summary Info Cards */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-start gap-2.5 text-slate-700">
            <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Title
              </h4>
              <p className="text-sm font-medium text-slate-900">{deal.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-700">
            <User className="h-4 w-4 text-slate-400 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Counterparty
              </h4>
              <p className="text-sm font-medium text-slate-900">{counterpartyName}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-700">
            <TrendingUp className="h-4 w-4 text-slate-400 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Deal Value
              </h4>
              <p className="text-sm font-bold text-slate-900">{formatINR(deal.value)}</p>
            </div>
          </div>

          {deal.rawDeadline && (
            <div className="flex items-start gap-2.5 text-slate-700">
              <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Deal Deadline
                </h4>
                {/* Dynamically tracking and processing live ticking dates inside the card placeholder */}
                <CountdownTimer targetDate={deal.rawDeadline} />
              </div>
            </div>
          )}

          {deal.description && (
            <div className="border-t border-slate-200 pt-2.5 mt-1">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                Terms / Description
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{deal.description}</p>
            </div>
          )}
        </div>

        {/* Timeline Log Section */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Deal Timeline
          </h3>

          {deal.timeline && deal.timeline.length > 0 ? (
            <div className="relative pl-4 border-l border-slate-200 ml-2 space-y-4 py-1">
              {deal.timeline.map((event, idx) => (
                <div key={event._id || idx} className="relative">
                  {/* Timeline node bullet indicator */}
                  <span className="absolute -left-[21px] top-1 bg-white border-2 border-slate-400 rounded-full h-2.5 w-2.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {(event.event || "STATUS_UPDATED").replaceAll("_", " ")}
                    </p>

                    {event.description && (
                      <p className="text-[11px] text-slate-600 mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-400">Created on {deal.createdAt}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 rounded-lg btn-primary cursor-pointer text-white text-sm font-semibold  transition-colors"
        >
          Close View
        </button>
      </div>
    </Modal>
  );
}
