import { useState } from 'react';

type TabKey = 'clients' | 'invoice' | 'finances' | 'overview';

export default function SoloBizInteractivePreview({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [tab, setTab] = useState<TabKey>('overview');

  const tabs: { id: TabKey; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'clients', label: 'Clients' },
    { id: 'invoice', label: 'Quote & Invoice' },
    { id: 'finances', label: 'Income & Expense' },
  ];

  return (
    <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/15 shadow-lg overflow-hidden">
      <div className="px-4 py-3 bg-[#F4F1E8] border-b border-[#202020]/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xs text-[#202020]">
            SoloBiz OS.xlsx
          </span>
          <span className="text-xs text-[#777777]">· Interactive Template Preview</span>
        </div>
        <div className="flex flex-wrap items-center gap-1 bg-[#FFFDF7] p-1 rounded-lg border border-[#202020]/10">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                tab === t.id
                  ? 'bg-[#3d5740] text-[#FFFDF7]'
                  : 'text-[#5C5C5C] hover:text-[#202020]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={compact ? 'p-4' : 'p-5 md:p-6'}>
        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#D6F0EE]/55 border border-[#202020]/8">
                <p className="text-[11px] text-[#5C5C5C]">Monthly Invoiced</p>
                <p className="font-mono-tabular font-bold text-lg text-[#202020] mt-0.5">
                  $2,450
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F7EDB8]/70 border border-[#202020]/8">
                <p className="text-[11px] text-[#5C5C5C]">Pending Follow-Up</p>
                <p className="font-mono-tabular font-bold text-lg text-[#202020] mt-0.5">
                  $680
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#E5DDF5]/60 border border-[#202020]/8">
                <p className="text-[11px] text-[#5C5C5C]">Net Margin</p>
                <p className="font-mono-tabular font-bold text-lg text-[#3d5740] mt-0.5">
                  84%
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-[#202020]/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F1E8] text-[#5C5C5C]">
                  <tr>
                    <th className="py-2 px-3 font-medium">Module Tab</th>
                    <th className="py-2 px-3 font-medium">Purpose</th>
                    <th className="py-2 px-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202020]/8 text-[#202020]">
                  <tr>
                    <td className="py-2 px-3 font-medium">Client Tracker</td>
                    <td className="py-2 px-3 text-[#5C5C5C]">Leads, active work, follow-up dates</td>
                    <td className="py-2 px-3 text-right font-mono-tabular text-[#3d5740]">Ready</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Quote &amp; Invoice</td>
                    <td className="py-2 px-3 text-[#5C5C5C]">Itemized PDF-ready client billing</td>
                    <td className="py-2 px-3 text-right font-mono-tabular text-[#3d5740]">Ready</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Follow-Up Log</td>
                    <td className="py-2 px-3 text-[#5C5C5C]">Due dates &amp; polite reminder log</td>
                    <td className="py-2 px-3 text-right font-mono-tabular text-[#3d5740]">Ready</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'clients' && (
          <div className="rounded-xl border border-[#202020]/10 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F1E8] text-[#5C5C5C]">
                <tr>
                  <th className="py-2 px-3 font-medium">Sample Client</th>
                  <th className="py-2 px-3 font-medium">Scope</th>
                  <th className="py-2 px-3 font-medium">Stage</th>
                  <th className="py-2 px-3 font-medium text-right">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202020]/8 text-[#202020]">
                <tr>
                  <td className="py-2.5 px-3 font-medium">Kivu Coffee Co.</td>
                  <td className="py-2.5 px-3 text-[#5C5C5C]">Packaging Audit</td>
                  <td className="py-2.5 px-3">Quote Sent</td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular">Nov 24</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Northwind Lab</td>
                  <td className="py-2.5 px-3 text-[#5C5C5C]">Web Prototype</td>
                  <td className="py-2.5 px-3 text-[#3d5740] font-medium">Active</td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular">Nov 27</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">Atelier Nine</td>
                  <td className="py-2.5 px-3 text-[#5C5C5C]">Copy Sprint</td>
                  <td className="py-2.5 px-3">Completed</td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular">Paid</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {tab === 'invoice' && (
          <div className="rounded-xl border border-[#202020]/12 bg-white p-4 space-y-3 text-xs">
            <div className="flex items-start justify-between border-b border-[#202020]/10 pb-3">
              <div>
                <p className="font-display font-bold text-sm text-[#202020]">
                  INVOICE #INV-104 (Sample)
                </p>
                <p className="text-[#777777]">Issued Nov 20, 2026 · Due Dec 04, 2026</p>
              </div>
              <span className="font-mono-tabular font-bold text-sm text-[#3d5740]">
                $680.00
              </span>
            </div>
            <div className="space-y-1.5 text-[#5C5C5C]">
              <div className="flex justify-between">
                <span>Brand Strategy &amp; Wireframe Sprint</span>
                <span className="font-mono-tabular text-[#202020]">$500.00</span>
              </div>
              <div className="flex justify-between">
                <span>Asset Handoff &amp; Style Guide</span>
                <span className="font-mono-tabular text-[#202020]">$180.00</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'finances' && (
          <div className="rounded-xl border border-[#202020]/10 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F1E8] text-[#5C5C5C]">
                <tr>
                  <th className="py-2 px-3 font-medium">Date</th>
                  <th className="py-2 px-3 font-medium">Entry</th>
                  <th className="py-2 px-3 font-medium">Type</th>
                  <th className="py-2 px-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202020]/8 text-[#202020]">
                <tr>
                  <td className="py-2 px-3 font-mono-tabular">2026-11-18</td>
                  <td className="py-2 px-3">Client Deposit — Northwind</td>
                  <td className="py-2 px-3 text-[#3d5740] font-medium">Income</td>
                  <td className="py-2 px-3 text-right font-mono-tabular">+$1,200.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono-tabular">2026-11-14</td>
                  <td className="py-2 px-3">Domain &amp; Hosting Renewal</td>
                  <td className="py-2 px-3 text-[#777777]">Expense</td>
                  <td className="py-2 px-3 text-right font-mono-tabular">-$42.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono-tabular">2026-11-08</td>
                  <td className="py-2 px-3">Atelier Nine Final Balance</td>
                  <td className="py-2 px-3 text-[#3d5740] font-medium">Income</td>
                  <td className="py-2 px-3 text-right font-mono-tabular">+$1,250.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
