import { useState } from "react";
import VendorReportPanel from "../components/VendorReportPanel";
import PRReportPanel from "../components/PRReportPanel";
import POReportPanel from "../components/POReportPanel";

export default function DownloadReports() {
  const [selected, setSelected] = useState(null);

  const renderPanel = () => {
    switch(selected) {
      case "vendors": return <VendorReportPanel />;
      case "pr": return <PRReportPanel />;
      case "po": return <POReportPanel />;
      default: return null;
    }
  };

  if (selected) {
    return (
      <div className="download-reports-container">
        <button 
          className="btn btn-outline" 
          onClick={() => setSelected(null)}
          style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          ← Back to Options
        </button>
        {renderPanel()}
      </div>
    );
  }

  return (
    <div className="download-reports-view">
      <header className="page-header">
        <div>
          <h1 className="page-title">Download Reports</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Generate and export procurement data in PDF or Excel formats
          </p>
        </div>
      </header>

      <div className="report-options">
        <div className="report-card" onClick={() => setSelected("vendors")}>
          <div className="report-icon">🏢</div>
          <div className="report-title">Vendor Directory</div>
          <div className="report-desc">Full supplier list with contact details, locations, and compliance ratings.</div>
        </div>

        <div className="report-card" onClick={() => setSelected("pr")}>
          <div className="report-icon">📋</div>
          <div className="report-title">Purchase Requisitions</div>
          <div className="report-desc">Summary of all requisitions, current statuses, and approval history logs.</div>
        </div>

        <div className="report-card" onClick={() => setSelected("po")}>
          <div className="report-icon">📦</div>
          <div className="report-title">Purchase Orders</div>
          <div className="report-desc">Detailed PO tracking, delivery statuses, and financial invoice records.</div>
        </div>
      </div>
    </div>
  );
}
