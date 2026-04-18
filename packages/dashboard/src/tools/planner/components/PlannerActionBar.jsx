export default function PlannerActionBar({
  isSickDay, hasSubjects, subjectsLoading,
  onUndoSickDay, onSickDay, onClearWeek, onImport,
}) {
  return (
    <div className="planner-action-bar">
      {isSickDay && !subjectsLoading && (
        <button className="planner-action-btn planner-action-btn--undo" onClick={onUndoSickDay}>
          ↩ Undo Sick Day
        </button>
      )}
      {!isSickDay && hasSubjects && !subjectsLoading && (
        <>
          <button className="planner-action-btn planner-action-btn--sick" onClick={onSickDay}>Sick Day</button>
          <button className="planner-action-btn planner-action-btn--clear" onClick={onClearWeek}>Clear Week</button>
        </>
      )}
      <button className="planner-action-btn planner-action-btn--import" onClick={onImport}>Import</button>
    </div>
  );
}
