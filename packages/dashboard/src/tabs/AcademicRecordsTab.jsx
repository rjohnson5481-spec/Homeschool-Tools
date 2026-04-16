import { useState } from 'react';
import { useAuth } from '@homeschool/shared';
import { useCourses }     from '../tools/academic-records/hooks/useCourses.js';
import { useEnrollments } from '../tools/academic-records/hooks/useEnrollments.js';
import { useSchoolYears } from '../tools/academic-records/hooks/useSchoolYears.js';
import CourseCatalogSheet       from '../tools/academic-records/components/CourseCatalogSheet.jsx';
import AddEditCourseSheet       from '../tools/academic-records/components/AddEditCourseSheet.jsx';
import EnrollmentSheet          from '../tools/academic-records/components/EnrollmentSheet.jsx';
import AddEditEnrollmentSheet   from '../tools/academic-records/components/AddEditEnrollmentSheet.jsx';
import SchoolYearSheet          from '../tools/academic-records/components/SchoolYearSheet.jsx';
import AddEditSchoolYearSheet   from '../tools/academic-records/components/AddEditSchoolYearSheet.jsx';
import './AcademicRecordsTab.css';

// Phase 2 entry point. Three flows wired this session:
//   - Course Catalog        (z-index 300 list / 310 editor)
//   - Enrollments           (z-index 300 list / 310 editor)
//   - School Year & Quarters (z-index 300 list / 310 editor)
// Only one list sheet is open at a time; editors stack at 310/311 above.
export default function AcademicRecordsTab() {
  const { user } = useAuth();
  const uid = user?.uid;

  const { courses, loading, error, addCourse, updateCourse, removeCourse } = useCourses(uid);
  const {
    enrollments, loading: enrollmentsLoading, error: enrollmentsError,
    addEnrollment, updateEnrollment, removeEnrollment,
  } = useEnrollments(uid, courses);
  const {
    schoolYears, loading: schoolYearsLoading, error: schoolYearsError,
    addSchoolYear, updateSchoolYear, removeSchoolYear,
    addQuarter, updateQuarter, removeQuarter,
  } = useSchoolYears(uid);

  // ─── Sheet state ───
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
  const [activeYearId, setActiveYearId]                             = useState(null);

  // ─── Course handlers ───
  function closeCatalog()       { setCatalogSheetOpen(false); setAddEditSheetOpen(false); setEditingCourse(null); }
  function handleEditCourse(c)  { setEditingCourse(c); setAddEditSheetOpen(true); }
  function handleAddCourse()    { setEditingCourse(null); setAddEditSheetOpen(true); }
  function closeAddEdit()       { setAddEditSheetOpen(false); setEditingCourse(null); }
  async function handleSaveCourse(data) {
    if (!uid) { console.warn('AcademicRecordsTab: uid missing on save — course will not persist'); return; }
    if (editingCourse) await updateCourse(editingCourse.id, data); else await addCourse(data);
    closeAddEdit();
  }
  async function handleDeleteCourse() {
    if (!editingCourse) return;
    await removeCourse(editingCourse.id);
    closeAddEdit();
  }

  // ─── Enrollment handlers ───
  function closeEnrollments()           { setEnrollmentSheetOpen(false); setAddEditEnrollmentSheetOpen(false); setEditingEnrollment(null); setEnrollingStudent(null); }
  function handleEditEnrollment(e)      { setEditingEnrollment(e); setEnrollingStudent(e.student); setAddEditEnrollmentSheetOpen(true); }
  function handleAddEnrollment(student) { setEnrollingStudent(student); setEditingEnrollment(null); setAddEditEnrollmentSheetOpen(true); }
  function closeAddEditEnrollment()     { setAddEditEnrollmentSheetOpen(false); setEditingEnrollment(null); setEnrollingStudent(null); }
  async function handleSaveEnrollment(data) {
    if (!uid) { console.warn('AcademicRecordsTab: uid missing on save — enrollment will not persist'); return; }
    if (editingEnrollment) await updateEnrollment(editingEnrollment.id, data); else await addEnrollment(data);
    closeAddEditEnrollment();
  }
  async function handleDeleteEnrollment() {
    if (!editingEnrollment) return;
    await removeEnrollment(editingEnrollment.id);
    closeAddEditEnrollment();
  }

  // ─── School Year + Quarter handlers ───
  function closeSchoolYearSheets() {
    setSchoolYearSheetOpen(false); setAddEditSchoolYearSheetOpen(false);
    setEditingSchoolYear(null); setEditingQuarter(null); setActiveYearId(null);
  }
  function closeAddEditSchoolYear() {
    setAddEditSchoolYearSheetOpen(false);
    setEditingSchoolYear(null); setEditingQuarter(null); setActiveYearId(null);
  }
  function handleAddSchoolYear()   { setEditingSchoolYear(null); setSchoolYearSheetMode('schoolYear'); setAddEditSchoolYearSheetOpen(true); }
  function handleEditSchoolYear(y) { setEditingSchoolYear(y);    setSchoolYearSheetMode('schoolYear'); setAddEditSchoolYearSheetOpen(true); }
  function handleAddQuarter(yearId) {
    setActiveYearId(yearId); setEditingQuarter(null);
    setSchoolYearSheetMode('quarter'); setAddEditSchoolYearSheetOpen(true);
  }
  function handleEditQuarter({ quarter, yearId }) {
    setActiveYearId(yearId); setEditingQuarter({ quarter, yearId });
    setSchoolYearSheetMode('quarter'); setAddEditSchoolYearSheetOpen(true);
  }
  async function handleSaveSchoolYearOrQuarter(data) {
    if (!uid) { console.warn('AcademicRecordsTab: uid missing on save — entry will not persist'); return; }
    if (schoolYearSheetMode === 'schoolYear') {
      if (editingSchoolYear) await updateSchoolYear(editingSchoolYear.id, data);
      else                   await addSchoolYear(data);
    } else {
      if (editingQuarter) await updateQuarter(activeYearId, editingQuarter.quarter.id, data);
      else                await addQuarter(activeYearId, data);
    }
    closeAddEditSchoolYear();
  }
  async function handleDeleteSchoolYearOrQuarter() {
    if (schoolYearSheetMode === 'schoolYear' && editingSchoolYear) {
      await removeSchoolYear(editingSchoolYear.id);
    } else if (schoolYearSheetMode === 'quarter' && editingQuarter) {
      await removeQuarter(activeYearId, editingQuarter.quarter.id);
    }
    closeAddEditSchoolYear();
  }

  // Item passed to AddEditSchoolYearSheet — flat shape {label,startDate,endDate}.
  const editingItem = schoolYearSheetMode === 'schoolYear'
    ? editingSchoolYear
    : (editingQuarter ? editingQuarter.quarter : null);

  return (
    <div className="ar-tab">

      <header className="ar-header">
        <h1 className="ar-title">Academic Records</h1>
        <p className="ar-subtitle">2025–2026</p>
      </header>

      <section className="ar-section">
        <p className="ar-section-label"><span>Quick Actions</span></p>

        <div className="ar-actions">
          <button className="ar-action" onClick={() => setCatalogSheetOpen(true)}>
            <span className="ar-action-icon" aria-hidden="true">📚</span>
            <span className="ar-action-label">Manage Course Catalog</span>
            <span className="ar-action-chevron" aria-hidden="true">›</span>
          </button>

          <button className="ar-action" onClick={() => setEnrollmentSheetOpen(true)}>
            <span className="ar-action-icon" aria-hidden="true">👤</span>
            <span className="ar-action-label">Manage Enrollments</span>
            <span className="ar-action-chevron" aria-hidden="true">›</span>
          </button>

          <button className="ar-action ar-action--disabled" disabled>
            <span className="ar-action-icon" aria-hidden="true">📥</span>
            <span className="ar-action-label">Import Curriculum Data</span>
            <span className="ar-action-soon">Soon</span>
          </button>

          <button className="ar-action" onClick={() => setSchoolYearSheetOpen(true)}>
            <span className="ar-action-icon" aria-hidden="true">🗓️</span>
            <span className="ar-action-label">Manage School Year &amp; Quarters</span>
            <span className="ar-action-chevron" aria-hidden="true">›</span>
          </button>

          <button className="ar-action ar-action--disabled" disabled>
            <span className="ar-action-icon" aria-hidden="true">📄</span>
            <span className="ar-action-label">Generate Report Card</span>
            <span className="ar-action-soon">Soon</span>
          </button>
        </div>
      </section>

      <CourseCatalogSheet
        open={catalogSheetOpen} onClose={closeCatalog}
        courses={courses} loading={loading} error={error}
        onEditCourse={handleEditCourse} onAddCourse={handleAddCourse}
      />
      <AddEditCourseSheet
        open={addEditSheetOpen} onClose={closeAddEdit}
        onSave={handleSaveCourse} onDelete={handleDeleteCourse}
        course={editingCourse} enrollments={enrollments}
      />

      <EnrollmentSheet
        open={enrollmentSheetOpen} onClose={closeEnrollments}
        enrollments={enrollments} courses={courses}
        loading={enrollmentsLoading} error={enrollmentsError}
        onEditEnrollment={handleEditEnrollment} onAddEnrollment={handleAddEnrollment}
      />
      <AddEditEnrollmentSheet
        open={addEditEnrollmentSheetOpen} onClose={closeAddEditEnrollment}
        onSave={handleSaveEnrollment} onDelete={handleDeleteEnrollment}
        student={enrollingStudent} courses={courses} enrollment={editingEnrollment}
      />

      <SchoolYearSheet
        open={schoolYearSheetOpen} onClose={closeSchoolYearSheets}
        schoolYears={schoolYears}
        loading={schoolYearsLoading} error={schoolYearsError}
        onEditSchoolYear={handleEditSchoolYear} onAddSchoolYear={handleAddSchoolYear}
        onEditQuarter={handleEditQuarter} onAddQuarter={handleAddQuarter}
      />
      <AddEditSchoolYearSheet
        open={addEditSchoolYearSheetOpen} onClose={closeAddEditSchoolYear}
        onSave={handleSaveSchoolYearOrQuarter} onDelete={handleDeleteSchoolYearOrQuarter}
        mode={schoolYearSheetMode} yearId={activeYearId} item={editingItem}
      />

    </div>
  );
}
