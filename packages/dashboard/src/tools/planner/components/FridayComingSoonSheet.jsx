import './FridayComingSoonSheet.css';

// Modal shown after a sick day cascade when the current student had any
// non-allday lesson on Friday at confirm time. Informational only — the
// cascade has already run and Friday content is untouched (still scheduled
// for this Friday). Proper Friday handling ships with the month view.
//
// Props:
//   onDismiss — called when the user taps "Got it" or the backdrop
export default function FridayComingSoonSheet({ onDismiss }) {
  return (
    <div className="fcs-overlay" onClick={onDismiss}>
      <div className="fcs-sheet" onClick={e => e.stopPropagation()}>
        <div className="fcs-handle" />

        <div className="fcs-header">
          <span className="fcs-title">Coming Soon</span>
        </div>

        <div className="fcs-body">
          <p className="fcs-msg">
            A month view and improved sick day cascading is coming soon.
            Friday's lessons were not moved — they are still scheduled for
            this Friday.
          </p>
        </div>

        <div className="fcs-footer">
          <button className="fcs-confirm" onClick={onDismiss}>Got it</button>
        </div>
      </div>
    </div>
  );
}
