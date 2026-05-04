import CourseCatalogSheet     from './CourseCatalogSheet.jsx';
import AddEditCourseSheet     from './AddEditCourseSheet.jsx';
import EnrollmentSheet        from './EnrollmentSheet.jsx';
import AddEditEnrollmentSheet from './AddEditEnrollmentSheet.jsx';
import SchoolYearSheet        from './SchoolYearSheet.jsx';
import AddEditSchoolYearSheet from './AddEditSchoolYearSheet.jsx';
import GradeEntrySheet        from './GradeEntrySheet.jsx';
import CalendarImportSheet    from './CalendarImportSheet.jsx';
import AttendanceDetailSheet  from './AttendanceDetailSheet.jsx';
import ReportCardGeneratorSheet from './ReportCardGeneratorSheet.jsx';
import SavedReportCardsSheet  from './SavedReportCardsSheet.jsx';
import ManageActivitiesSheet  from './ManageActivitiesSheet.jsx';
import AddEditActivitySheet   from './AddEditActivitySheet.jsx';
import CurriculumImportSheet from './CurriculumImportSheet.jsx';
import ComplianceSheet       from './ComplianceSheet.jsx';

export default function AcademicRecordsSheets(p) {
  return (
    <>
      <CourseCatalogSheet open={p.catalogSheetOpen} onClose={p.closeCatalog}
        courses={p.courses} loading={p.loading} error={p.error}
        onEditCourse={p.handleEditCourse} onAddCourse={p.handleAddCourse}
        onImportCurriculum={p.onImportCurriculum} />
      <AddEditCourseSheet open={p.addEditSheetOpen} onClose={p.closeAddEdit}
        onSave={p.handleSaveCourse} onDelete={p.handleDeleteCourse}
        course={p.editingCourse} enrollments={p.enrollments} />
      <EnrollmentSheet open={p.enrollmentSheetOpen} onClose={p.closeEnrollments}
        enrollments={p.enrollments} courses={p.courses}
        loading={p.enrollmentsLoading} error={p.enrollmentsError}
        onEditEnrollment={p.handleEditEnrollment} onAddEnrollment={p.handleAddEnrollment}
        students={p.students} />
      <AddEditEnrollmentSheet open={p.addEditEnrollmentSheetOpen} onClose={p.closeAddEditEnrollment}
        onSave={p.handleSaveEnrollment} onDelete={p.handleDeleteEnrollment}
        student={p.enrollingStudent}
        studentName={(p.students ?? []).find(s => s.studentId === p.enrollingStudent)?.name ?? ''}
        courses={p.courses} enrollment={p.editingEnrollment} />
      <SchoolYearSheet open={p.schoolYearSheetOpen} onClose={p.closeSchoolYearSheets}
        schoolYears={p.schoolYears} loading={p.schoolYearsLoading} error={p.schoolYearsError}
        onEditSchoolYear={p.handleEditSchoolYear} onAddSchoolYear={p.handleAddSchoolYear}
        onEditQuarter={p.handleEditQuarter} onAddQuarter={p.handleAddQuarter}
        onEditBreak={p.handleEditBreak} onAddBreak={p.handleAddBreak} />
      <AddEditSchoolYearSheet open={p.addEditSchoolYearSheetOpen} onClose={p.closeAddEditSchoolYear}
        onSave={p.handleSaveSchoolYearOrQuarter} onDelete={p.handleDeleteSchoolYearOrQuarter}
        mode={p.schoolYearSheetMode} yearId={p.activeYearId} item={p.editingItem} />
      <GradeEntrySheet open={p.gradeEntrySheetOpen} onClose={p.closeGradeEntry}
        onSave={p.handleSaveGrades} enrollments={p.studentEnrollments} courses={p.courses}
        grades={p.grades} selectedQuarterId={p.selectedQuarterId} quarterLabel={p.activeQuarterLabel} />
      <CalendarImportSheet open={p.calendarImportOpen} onClose={p.closeCalendarImport}
        onImport={p.handleCalendarImport}
        yearLabel={p.activeSchoolYear?.label} existingBreaks={p.activeSchoolYear?.breaks ?? []} />
      <AttendanceDetailSheet open={p.attendanceDetailOpen} onClose={p.closeAttendanceDetail}
        attendanceDays={p.attendanceDays} schoolYearLabel={p.activeSchoolYear?.label ?? '—'}
        student={p.selectedStudent} complianceSummary={p.complianceSummary} />
      <ReportCardGeneratorSheet open={p.reportCardOpen} onClose={p.closeReportCard}
        onSaveReport={p.saveReport} student={p.selectedStudent} students={p.students}
        activeSchoolYear={p.activeSchoolYear} selectedQuarterId={p.selectedQuarterId}
        enrollments={p.enrollments} courses={p.courses} grades={p.grades}
        attendanceDays={p.attendanceDays} reportNotes={p.reportNotes}
        saveNote={p.saveNote} activities={p.activities} />
      <SavedReportCardsSheet open={p.savedReportsOpen} onClose={p.closeSavedReports}
        savedReports={p.savedReports} loading={p.reportsLoading} onDelete={p.removeReport}
        students={p.students} />
      <ManageActivitiesSheet open={p.activitiesSheetOpen} onClose={p.closeActivitiesSheets}
        activities={p.activities} loading={p.activitiesLoading} error={p.activitiesError}
        onEditActivity={p.onEditActivity} onAddActivity={p.onAddActivity}
        students={p.students} />
      <AddEditActivitySheet open={p.addEditActivitySheetOpen} onClose={p.closeAddEditActivity}
        onSave={p.handleSaveActivity} onDelete={p.handleDeleteActivity}
        student={p.activityStudent}
        studentName={(p.students ?? []).find(s => s.studentId === p.activityStudent)?.name ?? ''}
        activity={p.editingActivity} />
      <CurriculumImportSheet open={p.curriculumImportOpen} onClose={p.closeCurriculumImport}
        onImport={p.handleCurriculumImport} courses={p.courses} />
      <ComplianceSheet open={p.complianceSheetOpen} onClose={p.closeCompliance}
        uid={p.uid} students={p.students} />
    </>
  );
}
