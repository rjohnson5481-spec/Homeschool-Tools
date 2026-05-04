// Full page layout — receives all state and handlers as props from App.jsx.
import { useState, useEffect } from 'react';
import Header          from './Header.jsx';
import DayStrip        from './DayStrip.jsx';
import SubjectCard     from './SubjectCard.jsx';
import PlannerSheets   from './PlannerSheets.jsx';
import CalendarWeekView from './CalendarWeekView.jsx';
import PlannerActionBar from './PlannerActionBar.jsx';
import SickDayManager  from './SickDayManager.jsx';
import MultiSelectBar  from './MultiSelectBar.jsx';
import HoursInputRow   from './HoursInputRow.jsx';
import { useSickDay } from '../hooks/useSickDay.js';
import { useMultiSelect } from '../hooks/useMultiSelect.js';
import { usePlannerHelpers } from '../hooks/usePlannerHelpers.js';
import { useCellToggles } from '../hooks/useCellToggles.js';
import { useCompliance } from '../hooks/useCompliance.js';
import { useSchoolSettings } from '../../../hooks/useSchoolSettings.js';
import { getMondayOf, toWeekId, formatWeekLabel, DAY_NAMES } from '../constants/days.js';
import './PlannerLayout.css';

function useIsDesktop() {
  const [d, setD] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 810);
  useEffect(() => { const mq = window.matchMedia('(min-width: 810px)'); const h = e => setD(e.matches); mq.addEventListener('change', h); return () => mq.removeEventListener('change', h); }, []);
  return d;
}

export default function PlannerLayout({
  user,
  weekId,
  weekDates, prevWeek, nextWeek,
  subjects, dayData, subjectsLoading, updateCell, removeSubject,
  importCell, jumpToWeek, deleteWeek,
  performSickDay, performUndoSickDay,
  loadWeekDataFrom,
  pdfImport,
  students,
  plannerSubjects,
  student, setStudent,
  day, setDay,
  editTarget, setEditTarget,
  showUpload, setShowUpload,
  showAddSubject, setShowAddSubject,
  showMonthPicker, setShowMonthPicker,
  showSickDay, setShowSickDay,
  showUndoSickDay, setShowUndoSickDay,
}) {
  function handleMonthDaySelect(date) {
    jumpToWeek(toWeekId(getMondayOf(date)));
    setDay(date.getDay() - 1); // JS Mon=1 → dayIndex=0
    setShowMonthPicker(false);
  }

  function handleDeleteWeek() {
    if (!window.confirm('Clear all lessons for this week? This cannot be undone.')) return;
    deleteWeek();
  }

  // Batch-add a cell for each (dayIndex, student) pair.
  // lessonDetails is an optional { [dayIndex]: lessonText } map — if a value
  // exists for a dayIndex it becomes the initial lesson text; otherwise the
  // cell is created blank. Uses importCell with overwrite=false so existing
  // cells are preserved.
  async function handleBatchAddSubject(subject, cells, lessonDetails) {
    const details = lessonDetails ?? {};
    await Promise.all(cells.map(({ dayIndex, student: cellStudent }) => {
      const lesson = details[dayIndex] ?? '';
      return importCell(weekId, cellStudent, subject, dayIndex,
        { lesson, note: '', done: false, flag: false }, false);
    }));
    setShowAddSubject(false);
  }

  const { handleApplySchedule, handleConfirmImport, handleMoveCell } = usePlannerHelpers({
    user, weekId, studentId: student, students,
    pdfImport, importCell,
    jumpToWeek, setStudent,
  });

  const allDayData = dayData['allday'] ?? null, hasAllDay = Boolean(allDayData);
  const [showSubjects, setShowSubjects] = useState(false);
  const {
    sickDayIndices, hasSickDayThisWeek, isSickDay,
    handleSickDayConfirm, handleUndoSickDay,
    showFridayComingSoon,
    handleFridayComingSoonConfirm, handleFridayComingSoonDismiss,
  } = useSickDay({
    uid: user?.uid, weekId, studentId: student, day,
    performSickDay, performUndoSickDay,
    setDay, setShowSickDay, setShowUndoSickDay,
  });
  const regularSubjects = subjects.filter(s => s !== 'allday');
  const hasSubjects = subjects.length > 0;
  const doneCount = regularSubjects.filter(s => dayData[s]?.done).length;

  const isDesktop = useIsDesktop();

  const multiSelect = useMultiSelect({
    uid: user?.uid, weekId, student, day, subjects: regularSubjects,
  });

  const { handleToggleDone, handleToggleFlag, toggleCellDone } =
    useCellToggles({ user, weekId, student, day, dayData, updateCell });

  const compliance = useCompliance({ uid: user?.uid, weekDates, student });
  const { schoolName, tagline } = useSchoolSettings(user?.uid);

  return (
    <div className={`planner${isDesktop ? ' cwv-active' : ''}`}>
      <Header
        user={user}
        student={student}
        onStudentChange={setStudent}
        weekDates={weekDates}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
        students={students}
        onUpload={() => setShowUpload(true)}
        onCalendar={() => setShowMonthPicker(true)}
        schoolName={schoolName}
        tagline={tagline}
      />

      <div className="planner-body">
        {/* Desktop-only week nav — planner header is hidden in the shell at ≥810px */}
        <div className="planner-week-nav-desktop">
          <button className="planner-week-nav-btn" onClick={prevWeek} aria-label="Previous week">‹</button>
          <span className="planner-week-nav-label">{formatWeekLabel(weekDates)}</span>
          <button className="planner-week-nav-btn" onClick={nextWeek} aria-label="Next week">›</button>
        </div>

        {isDesktop && (
          <CalendarWeekView
            weekDates={weekDates} prevWeek={prevWeek} nextWeek={nextWeek}
            jumpToToday={() => jumpToWeek(toWeekId(getMondayOf(new Date())))}
            loadWeekDataFrom={loadWeekDataFrom} student={student} weekId={weekId}
            onEditCell={(subject, di) => { setDay(di); setEditTarget({ subject, day: di }); }}
            onAddSubject={(di) => { setDay(di); setShowAddSubject(true); }}
            onMoveCell={handleMoveCell}
            onToggleDone={toggleCellDone}
            hoursEnabled={compliance.hoursEnabled}
            hoursByDate={compliance.hoursByDate}
            onSaveHours={compliance.saveHours}
            onFlushHours={compliance.flushPendingSave}
          />
        )}

        <DayStrip
          dates={weekDates}
          selected={day}
          onSelect={setDay}
          sickDayIndices={sickDayIndices}
          students={students}
          student={student}
          onStudentChange={setStudent}
        />

        {isSickDay && (
          <div className="planner-sick-banner">Sick Day</div>
        )}

        {compliance.hoursEnabled && (
          <HoursInputRow
            selectedDate={weekDates[day]}
            hours={compliance.hoursByDate[toWeekId(weekDates[day])]}
            onSave={hours => compliance.saveHours(toWeekId(weekDates[day]), hours)}
            onFlush={compliance.flushPendingSave}
          />
        )}

        <main className="planner-main">
          {/* Desktop-only day header */}
          <div className="planner-day-header">
            <div>
              <h2 className="planner-day-title">{DAY_NAMES[day]}, {weekDates[day]?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h2>
              <p className="planner-day-subtitle">{regularSubjects.length} subjects · {doneCount} completed</p>
            </div>
            <button className="planner-day-add-btn" onClick={() => setShowAddSubject(true)}>+ Add</button>
          </div>

          {/* Empty state — shown when day has no subjects */}
          {!subjectsLoading && !hasSubjects && (
            <div className="planner-empty">
              <div className="planner-empty-icon">📋</div>
              <p className="planner-empty-title">Nothing planned yet</p>
              <p className="planner-empty-subtitle">Import a PDF or add a subject to get started</p>
              <button className="planner-empty-import-btn" onClick={() => setShowUpload(true)}>📄 Import PDF</button>
              <button className="planner-empty-add-btn" onClick={() => setShowAddSubject(true)}>+ Add Subject</button>
            </div>
          )}

          {hasAllDay && <SubjectCard subject="allday" data={allDayData} onEdit={() => setEditTarget({ subject: 'allday', day })}
            onToggleDone={() => {}} onToggleFlag={() => {}} />}
          {hasAllDay && <button className="planner-show-subjects-btn" onClick={() => setShowSubjects(s => !s)}>
            {showSubjects ? 'Hide subjects ↑' : 'Show subjects ↓'}</button>}
          {(!hasAllDay || showSubjects) && (
            <div className="planner-subjects">
              {regularSubjects.map(subject => (
                <SubjectCard
                  key={subject}
                  subject={subject}
                  data={dayData[subject]}
                  onEdit={() => setEditTarget({ subject, day })}
                  onToggleDone={() => handleToggleDone(subject)}
                  onToggleFlag={() => handleToggleFlag(subject)}
                  isSelectMode={multiSelect.isSelectMode}
                  isSelected={multiSelect.selectedKeys.has(subject)}
                  onLongPress={() => multiSelect.enterSelectMode(subject)}
                  onSelect={() => multiSelect.toggleSelect(subject)}
                />
              ))}
            </div>
          )}

          {!subjectsLoading && hasSubjects && (!hasAllDay || showSubjects) && (
            <button className="planner-add-btn" onClick={() => setShowAddSubject(true)}>
              + Add Subject
            </button>
          )}
        </main>
      </div>

      {!multiSelect.isSelectMode && (
        <PlannerActionBar
          isSickDay={hasSickDayThisWeek} hasSubjects={hasSubjects} subjectsLoading={subjectsLoading}
          onUndoSickDay={() => setShowUndoSickDay(true)} onSickDay={() => setShowSickDay(true)}
          onClearWeek={handleDeleteWeek} onImport={() => setShowUpload(true)}
        />
      )}

      <PlannerSheets
        editTarget={editTarget} dayData={dayData} updateCell={updateCell} removeSubject={removeSubject} setEditTarget={setEditTarget}
        showUpload={showUpload} pdfImport={pdfImport} handleApplySchedule={handleApplySchedule} handleConfirmImport={handleConfirmImport} setShowUpload={setShowUpload}
        showAddSubject={showAddSubject} subjects={subjects} plannerSubjects={plannerSubjects} weekDates={weekDates} day={day} student={student} students={students} handleBatchAddSubject={handleBatchAddSubject} setShowAddSubject={setShowAddSubject}
        showMonthPicker={showMonthPicker} weekId={weekId} handleMonthDaySelect={handleMonthDaySelect} setShowMonthPicker={setShowMonthPicker} />

      <SickDayManager
        subjects={subjects} dayData={dayData} day={day}
        weekDates={weekDates} loadWeekDataFrom={loadWeekDataFrom}
        showSickDay={showSickDay} setShowSickDay={setShowSickDay}
        showUndoSickDay={showUndoSickDay} setShowUndoSickDay={setShowUndoSickDay}
        showFridayComingSoon={showFridayComingSoon}
        handleSickDayConfirm={handleSickDayConfirm}
        handleUndoSickDay={handleUndoSickDay}
        handleFridayComingSoonConfirm={handleFridayComingSoonConfirm}
        handleFridayComingSoonDismiss={handleFridayComingSoonDismiss}
      />

      {!isDesktop && multiSelect.isSelectMode && (
        <MultiSelectBar
          selectedCount={multiSelect.selectedCount}
          day={day}
          deleteConfirmPending={multiSelect.deleteConfirmPending}
          onSelectAll={multiSelect.selectAll}
          onMarkDone={multiSelect.handleMarkDone}
          onMoveToDay={multiSelect.handleMoveToDay}
          onDelete={multiSelect.handleDelete}
          onCancel={multiSelect.exitSelectMode}
        />
      )}
    </div>
  );
}
