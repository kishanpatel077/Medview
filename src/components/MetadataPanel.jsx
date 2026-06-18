import { FiDatabase } from 'react-icons/fi';

const groups = [
  {
    title: 'Study Information',
    rows: [
      ['Study UID', '1.2.840.113619'],
      ['Modality', 'CT / MRI / XR'],
      ['Body Region', 'Thorax'],
      ['Study Date', '2026-06-18'],
    ],
  },
  {
    title: 'Series Information',
    rows: [
      ['Series', 'CT Axial Chest'],
      ['Images', '312'],
      ['Slice Thickness', '1.25 mm'],
      ['Kernel', 'B31f'],
    ],
  },
  {
    title: 'Image Properties',
    rows: [
      ['Matrix', '512 x 512'],
      ['Spacing', '0.72 mm'],
      ['Window', '42 / 380'],
      ['Photometric', 'MONOCHROME2'],
    ],
  },
];

export default function MetadataPanel() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
        <FiDatabase className="text-primary" />
        DICOM Metadata
      </div>
      {groups.map((group) => (
        <section key={group.title}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-muted">
            {group.title}
          </h3>
          <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
            {group.rows.map(([label, value]) => (
              <div
                className="grid grid-cols-[0.92fr_1.08fr] gap-2 border-b border-slate-200 px-3 py-2 text-xs last:border-b-0 dark:border-slate-800"
                key={label}
              >
                <span className="text-slate-500 dark:text-muted">{label}</span>
                <span className="break-words font-medium text-slate-800 dark:text-slate-200">{value}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
