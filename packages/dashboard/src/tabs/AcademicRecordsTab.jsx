import { useState, useEffect } from 'react';
import { useAuth } from '@homeschool/shared';
import { db } from '@homeschool/shared';
import { doc, onSnapshot } from 'firebase/firestore';
import { useCourses }         from '../tools/academic-records/hooks/useCourses.js';
import { useEnrollments }     from '../tools/academic-records/hooks/useEnrollments.js';
import { useSchoolYears }     from '../tools/academic-records/hooks/useSchoolYears.js';
import { useAcademicSummary } from '../tools/academic-records/hooks/useAcademicSummary.js';
import { useGrades }          from '../tools/academic-records/hooks/useGrades.js';
import { useReportNotes }     from '../tools/academic-records/hooks/useReportNotes.js';
import { useSavedReports }    from '../tools/academic-records/hooks/useSavedReports.js';
import { useActivities }      from '../tools/academic-records/hooks/useActivities.js';
import RecordsMainView        from '../tools/academic-records/components/RecordsMainView.jsx';
import AcademicRecordsSheets  from '../tools/academic-records/components/AcademicRecordsSheets.jsx';
import './AcademicRecordsTab.css';

export default function AcademicRecordsTab() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [students, setStudents] = useState([]);
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(doc(db, `users/${uid}/settings/students`), snap => {
      setStudents(snap.data()?.names ?? []);
    });
  }, [uid]);

  const { courses, loading, error, addCourse, updateCourse, removeCourse } = useCourses(uid);
  const { enrollments, loading: enrollmentsLoading, error: enrollmentsError, addEnrollment, updateEnrollment, removeEnrollment } = useEnrollments(uid, courses);
  const { schoolYears, loading: schoolYearsLoading, error: schoolYearsError, addSchoolYear, updateSchoolYear, removeSchoolYear, addQuarter, updateQuarter, removeQuarter, addBreak, updateBreak, removeBreak } = useSchoolYears(uid);
  const [selectedStudent, setSelectedStudent]     = useState(null);
  useEffect(() => { if (students.length && !selectedStudent) setSelectedStudent(students[0]); }, [students, selectedStudent]);
  const [selectedQuarterId, setSelectedQuarterId] = useState(null);
  const summary = useAcademicSummary(uid, selectedStudent, schoolYears, enrollments, courses);
  const { grades, saveGrade, addGrade } = useGrades(uid);
  const { reportNotes, saveNote } = useReportNotes(uid);
  const { savedReports, loading: reportsLoading, saveReport, removeReport } = useSavedReports(uid);
  const { activities, loading: activitiesLoading, error: activitiesError, addActivity: fbAddActivity, updateActivity: fbUpdateActivity, removeActivity: fbRemoveActivity } = useActivities(uid);

  useEffect(() => {
    if (summary.activeQuarterId && selectedQuarterId == null) setSelectedQuarterId(summary.activeQuarterId);
  }, [summary.activeQuarterId, selectedQuarterId]);

  // Sheet state
  const [catalogSheetOpen, setCatalogSheetOpen] = useState(false);
  const [addEditSheetOpen, setAddEditSheetOpen] = useState(false);
  const [editingCourse, setEditingCourse]       = useState(null);
  const [enrollmentSheetOpen, setEnrollmentSheetOpen]               = useState(false);
  const [addEditEnrollmentSheetOpen, setAddEditEnrollmentSheetOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment]                   = useState(null);
  const [enrollingStudent, setEnrollingStudent]                     = useState(null);
  const [schoolYearSheetOpen, setSchoolYearSheetOpen]               = useState(false);
  const [addEditSchoolYearSheetOpen, setAddEditSchoolYearSheetOpen] = useState(false);
  const [schoolYearSheetMode, setSchoolYearSheetMode]               = useState('schoolYear');
  const [editingSchoolYear, setEditingSchoolYear]                   = useState(null);
  const [editingQuarter, setEditingQuarter]                         = useState(null);
  const [editingBreak, setEditingBreak]                             = useState(null);
  const [activeYearId, setActiveYearId]                             = useState(null);
  const [gradeEntrySheetOpen, setGradeEntrySheetOpen]               = useState(false);
  const [calendarImportOpen, setCalendarImportOpen]                 = useState(false);
  const [attendanceDetailOpen, setAttendanceDetailOpen]             = useState(false);
  const [reportCardOpen, setReportCardOpen]                         = useState(false);
  const [savedReportsOpen, setSavedReportsOpen]                     = useState(false);
  const [activitiesSheetOpen, setActivitiesSheetOpen]               = useState(false);
  const [addEditActivitySheetOpen, setAddEditActivitySheetOpen]     = useState(false);
  const [editingActivity, setEditingActivity]                       = useState(null);
  const [activityStudent, setActivityStudent]                       = useState(null);
  const [curriculumImportOpen, setCurriculumImportOpen]             = useState(false);
  const [complianceSheetOpen, setComplianceSheetOpen]               = useState(false);

  // ─── Course handlers ───
  function closeCatalog()       { setCatalogSheetOpen(false); setAddEditSheetOpen(false); setEditingCourse(null); }
  function handleEditCourse(c)  { setEditingCourse(c); setAddEditSheetOpen(true); }
  function handleAddCourse()    { setEditingCourse(null); setAddEditSheetOpen(true); }
  function closeAddEdit()       { setAddEditSheetOpen(false); setEditingCourse(null); }
  async function handleSaveCourse(data) {
    if (!uid) return;
    if (editingCourse) await updateCourse(editingCourse.id, data); else await addCourse(data);
    closeAddEdit();
  }
  async function handleDeleteCourse() { if (editingCourse) { await removeCourse(editingCourse.id); closeAddEdit(); } }

  // ─── Enrollment handlers ───
  function closeEnrollments()           { setEnrollmentSheetOpen(false); setAddEditEnrollmentSheetOpen(false); setEditingEnrollment(null); setEnrollingStudent(null); }
  function handleEditEnrollment(e)      { setEditingEnrollment(e); setEnrollingStudent(e.student); setAddEditEnrollmentSheetOpen(true); }
  function handleAddEnrollment(student) { setEnrollingStudent(student); setEditingEnrollment(null); setAddEditEnrollmentSheetOpen(true); }
  function closeAddEditEnrollment()     { setAddEditEnrollmentSheetOpen(false); setEditingEnrollment(null); setEnrollingStudent(null); }
  async function handleSaveEnrollment(data) {
    if (!uid) return;
    if (editingEnrollment) await updateEnrollment(editingEnrollment.id, data); else await addEnrollment(data);
    closeAddEditEnrollment();
  }
  async function handleDeleteEnrollment() { if (editingEnrollment) { await removeEnrollment(editingEnrollment.id); closeAddEditEnrollment(); } }

  // ─── School Year + Quarter + Break handlers ───
  function closeSchoolYearSheets() { setSchoolYearSheetOpen(false); setAddEditSchoolYearSheetOpen(false); setEditingSchoolYear(null); setEditingQuarter(null); setEditingBreak(null); setActiveYearId(null); }
  function closeAddEditSchoolYear() { setAddEditSchoolYearSheetOpen(false); setEditingSchoolYear(null); setEditingQuarter(null); setEditingBreak(null); setActiveYearId(null); }
  function handleAddSchoolYear()   { setEditingSchoolYear(null); setSchoolYearSheetMode('schoolYear'); setAddEditSchoolYearSheetOpen(true); }
  function handleEditSchoolYear(y) { setEditingSchoolYear(y); setSchoolYearSheetMode('schoolYear'); setAddEditSchoolYearSheetOpen(true); }
  function handleAddQuarter(yearId) { setActiveYearId(yearId); setEditingQuarter(null); setSchoolYearSheetMode('quarter'); setAddEditSchoolYearSheetOpen(true); }
  function handleEditQuarter({ quarter, yearId }) { setActiveYearId(yearId); setEditingQuarter({ quarter, yearId }); setSchoolYearSheetMode('quarter'); setAddEditSchoolYearSheetOpen(true); }
  function handleAddBreak(yearId) { setActiveYearId(yearId); setEditingBreak(null); setSchoolYearSheetMode('break'); setAddEditSchoolYearSheetOpen(true); }
  function handleEditBreak({ break: b, yearId }) { setActiveYearId(yearId); setEditingBreak({ break: b, yearId }); setSchoolYearSheetMode('break'); setAddEditSchoolYearSheetOpen(true); }
  async function handleSaveSchoolYearOrQuarter(data) {
    if (!uid) return;
    if (schoolYearSheetMode === 'schoolYear') { if (editingSchoolYear) await updateSchoolYear(editingSchoolYear.id, data); else await addSchoolYear(data); }
    else if (schoolYearSheetMode === 'quarter') { if (editingQuarter) await updateQuarter(activeYearId, editingQuarter.quarter.id, data); else await addQuarter(activeYearId, data); }
    else if (schoolYearSheetMode === 'break') { if (editingBreak) await updateBreak(activeYearId, editingBreak.break.id, data); else await addBreak(activeYearId, data); }
    closeAddEditSchoolYear();
  }
  async function handleDeleteSchoolYearOrQuarter() {
    if (schoolYearSheetMode === 'schoolYear' && editingSchoolYear) await removeSchoolYear(editingSchoolYear.id);
    else if (schoolYearSheetMode === 'quarter' && editingQuarter) await removeQuarter(activeYearId, editingQuarter.quarter.id);
    else if (schoolYearSheetMode === 'break' && editingBreak) await removeBreak(activeYearId, editingBreak.break.id);
    closeAddEditSchoolYear();
  }
  const editingItem = schoolYearSheetMode === 'schoolYear' ? editingSchoolYear : schoolYearSheetMode === 'quarter' ? (editingQuarter?.quarter ?? null) : (editingBreak?.break ?? null);

  // ─── Grade entry ───
  async function handleSaveGrades(edits) {
    if (!uid) return;
    for (const e of edits) { if (e.existingId) await saveGrade(e.existingId, { enrollmentId: e.enrollmentId, quarterId: e.quarterId, grade: e.grade }); else await addGrade({ enrollmentId: e.enrollmentId, quarterId: e.quarterId, grade: e.grade }); }
    setGradeEntrySheetOpen(false);
  }
  const activeQuarterLabel = (summary.activeSchoolYear?.quarters ?? []).find(q => q.id === selectedQuarterId)?.label ?? 'Quarter';

  // ─── Calendar import ───
  async function handleCalendarImport(breaks) {
    if (!uid || !summary.activeSchoolYear) return;
    const yearId = summary.activeSchoolYear.id; const existing = summary.activeSchoolYear.breaks ?? [];
    for (const b of breaks) { if (!existing.some(e => e.startDate === b.startDate && e.endDate === b.endDate)) await addBreak(yearId, { label: b.label, startDate: b.startDate, endDate: b.endDate }); }
    setCalendarImportOpen(false);
  }

  // ─── Activity handlers ───
  function closeActivitiesSheets() { setActivitiesSheetOpen(false); setAddEditActivitySheetOpen(false); setEditingActivity(null); setActivityStudent(null); }
  function closeAddEditActivity() { setAddEditActivitySheetOpen(false); setEditingActivity(null); setActivityStudent(null); }
  function onAddActivity(student) { setActivityStudent(student); setEditingActivity(null); setAddEditActivitySheetOpen(true); }
  function onEditActivity(a) { setEditingActivity(a); setActivityStudent(a.student); setAddEditActivitySheetOpen(true); }
  async function handleSaveActivity(data) { if (!uid) return; if (editingActivity) await fbUpdateActivity(editingActivity.id, data); else await fbAddActivity(data); closeAddEditActivity(); }
  async function handleDeleteActivity() { if (editingActivity) { await fbRemoveActivity(editingActivity.id); closeActivitiesSheets(); } }

  // ─── Curriculum import ───
  async function handleCurriculumImport(newCourses) {
    if (!uid) return;
    for (const c of newCourses) await addCourse(c);
    setCurriculumImportOpen(false);
  }

  return (
    <div className="ar-tab">
      <RecordsMainView
        students={students} selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent}
        selectedQuarterId={selectedQuarterId} setSelectedQuarterId={setSelectedQuarterId}
        summary={summary} courses={courses} grades={grades}
        onCatalogOpen={() => setCatalogSheetOpen(true)} onEnrollmentsOpen={() => setEnrollmentSheetOpen(true)}
        onSchoolYearOpen={() => setSchoolYearSheetOpen(true)} onEnterGrades={() => setGradeEntrySheetOpen(true)}
        onCalendarImport={summary.activeSchoolYear ? () => setCalendarImportOpen(true) : null}
        onAttendanceDetail={() => setAttendanceDetailOpen(true)} onGenerateReport={() => setReportCardOpen(true)}
        onOpenSavedReports={() => setSavedReportsOpen(true)} onOpenActivities={() => setActivitiesSheetOpen(true)}
        onComplianceOpen={() => setComplianceSheetOpen(true)}
      />
      <AcademicRecordsSheets
        students={students}
        catalogSheetOpen={catalogSheetOpen} closeCatalog={closeCatalog} courses={courses} loading={loading} error={error}
        handleEditCourse={handleEditCourse} handleAddCourse={handleAddCourse}
        addEditSheetOpen={addEditSheetOpen} closeAddEdit={closeAddEdit} handleSaveCourse={handleSaveCourse}
        handleDeleteCourse={handleDeleteCourse} editingCourse={editingCourse} enrollments={enrollments}
        enrollmentSheetOpen={enrollmentSheetOpen} closeEnrollments={closeEnrollments}
        enrollmentsLoading={enrollmentsLoading} enrollmentsError={enrollmentsError}
        handleEditEnrollment={handleEditEnrollment} handleAddEnrollment={handleAddEnrollment}
        addEditEnrollmentSheetOpen={addEditEnrollmentSheetOpen} closeAddEditEnrollment={closeAddEditEnrollment}
        handleSaveEnrollment={handleSaveEnrollment} handleDeleteEnrollment={handleDeleteEnrollment}
        enrollingStudent={enrollingStudent} editingEnrollment={editingEnrollment}
        schoolYearSheetOpen={schoolYearSheetOpen} closeSchoolYearSheets={closeSchoolYearSheets}
        schoolYears={schoolYears} schoolYearsLoading={schoolYearsLoading} schoolYearsError={schoolYearsError}
        handleEditSchoolYear={handleEditSchoolYear} handleAddSchoolYear={handleAddSchoolYear}
        handleEditQuarter={handleEditQuarter} handleAddQuarter={handleAddQuarter}
        handleEditBreak={handleEditBreak} handleAddBreak={handleAddBreak}
        addEditSchoolYearSheetOpen={addEditSchoolYearSheetOpen} closeAddEditSchoolYear={closeAddEditSchoolYear}
        handleSaveSchoolYearOrQuarter={handleSaveSchoolYearOrQuarter} handleDeleteSchoolYearOrQuarter={handleDeleteSchoolYearOrQuarter}
        schoolYearSheetMode={schoolYearSheetMode} activeYearId={activeYearId} editingItem={editingItem}
        gradeEntrySheetOpen={gradeEntrySheetOpen} closeGradeEntry={() => setGradeEntrySheetOpen(false)}
        handleSaveGrades={handleSaveGrades} studentEnrollments={summary.studentEnrollments}
        grades={grades} selectedQuarterId={selectedQuarterId} activeQuarterLabel={activeQuarterLabel}
        calendarImportOpen={calendarImportOpen} closeCalendarImport={() => setCalendarImportOpen(false)}
        handleCalendarImport={handleCalendarImport} activeSchoolYear={summary.activeSchoolYear}
        attendanceDetailOpen={attendanceDetailOpen} closeAttendanceDetail={() => setAttendanceDetailOpen(false)}
        attendanceDays={summary.attendanceDays} selectedStudent={selectedStudent}
        reportCardOpen={reportCardOpen} closeReportCard={() => setReportCardOpen(false)}
        saveReport={saveReport} reportNotes={reportNotes} saveNote={saveNote} activities={activities}
        savedReportsOpen={savedReportsOpen} closeSavedReports={() => setSavedReportsOpen(false)}
        savedReports={savedReports} reportsLoading={reportsLoading} removeReport={removeReport}
        activitiesSheetOpen={activitiesSheetOpen} closeActivitiesSheets={closeActivitiesSheets}
        activitiesLoading={activitiesLoading} activitiesError={activitiesError}
        onEditActivity={onEditActivity} onAddActivity={onAddActivity}
        addEditActivitySheetOpen={addEditActivitySheetOpen} closeAddEditActivity={closeAddEditActivity}
        handleSaveActivity={handleSaveActivity} handleDeleteActivity={handleDeleteActivity}
        editingActivity={editingActivity} activityStudent={activityStudent}
        onImportCurriculum={() => setCurriculumImportOpen(true)}
        curriculumImportOpen={curriculumImportOpen} closeCurriculumImport={() => setCurriculumImportOpen(false)}
        handleCurriculumImport={handleCurriculumImport}
        complianceSheetOpen={complianceSheetOpen} closeCompliance={() => setComplianceSheetOpen(false)}
        uid={uid}
      />
    </div>
  );
}
