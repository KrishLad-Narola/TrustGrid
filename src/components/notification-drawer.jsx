// import { X, FileCheck2, AlertTriangle, Handshake, Gauge } from "lucide-react";

// const items = [
//   { icon: AlertTriangle, color: "text-warning", title: "Bank Statement expiring", desc: "Expires in 28 days. Re-upload soon.", time: "12m" },
//   { icon: FileCheck2, color: "text-success", title: "GST re-verified", desc: "Verification refreshed by admin.", time: "2h" },
//   { icon: Handshake, color: "text-primary", title: "New deal request", desc: "Helios Renewables wants to initiate a deal.", time: "5h" },
//   { icon: Gauge, color: "text-accent", title: "Trust score updated", desc: "Your score increased by +2 to 85.", time: "1d" },
// ];

// export function NotificationDrawer({ open, onClose }) {
//   return (
//     <>
//       <div
//         className={`fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"
//           }`}
//         onClick={onClose}
//       />
//       <aside
//         className={`fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-card border-l border-border z-40 transition-transform shadow-xl ${open ? "translate-x-0" : "translate-x-full"
//           }`}
//       >
//         <div className="h-16 px-5 flex items-center justify-between border-b border-border">
//           <h3 className="font-semibold">Notifications</h3>
//           <button onClick={onClose} className="size-8 rounded-md hover:bg-muted flex items-center justify-center">
//             <X className="size-4" />
//           </button>
//         </div>
//         <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-4rem)]">
//           {items.map((n, i) => {
//             const Icon = n.icon;
//             return (
//               <div key={i} className="glass-card p-3 flex gap-3">
//                 <div className={`size-9 rounded-lg bg-muted flex items-center justify-center ${n.color}`}>
//                   <Icon className="size-4" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center justify-between gap-2">
//                     <p className="text-sm font-medium truncate">{n.title}</p>
//                     <span className="text-[10px] text-muted-foreground font-mono">{n.time}</span>
//                   </div>
//                   <p className="text-xs text-muted-foreground">{n.desc}</p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </aside>
//     </>
//   );
// }

import { X, FileCheck2, AlertTriangle, Handshake, Gauge } from "lucide-react";

const items = [
  { icon: AlertTriangle, color: "text-warning", title: "Bank Statement expiring", desc: "Expires in 28 days. Re-upload soon.", time: "12m" },
  { icon: FileCheck2, color: "text-success", title: "GST re-verified", desc: "Verification refreshed by admin.", time: "2h" },
  { icon: Handshake, color: "text-primary", title: "New deal request", desc: "Helios Renewables wants to initiate a deal.", time: "5h" },
  { icon: Gauge, color: "text-accent", title: "Trust score updated", desc: "Your score increased by +2 to 85.", time: "1d" },
];

export function NotificationDrawer({ open, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 transition-opacity duration-300 opacity-0 pointer-events-none overflow-hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-card border-l border-border z-40 transition-all duration-300 shadow-xl ${
          open 
            ? "translate-x-0 opacity-100 visible" 
            : "translate-x-full opacity-0 invisible"
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          <button onClick={onClose} className="size-8 rounded-md hover:bg-muted flex items-center cursor-pointer justify-center">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto">
          {items.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} className="glass-card p-3 flex gap-3">
                <div className={`size-9 rounded-lg bg-muted flex items-center justify-center ${n.color}`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <span className="text-[10px] text-muted-foreground font-mono">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}