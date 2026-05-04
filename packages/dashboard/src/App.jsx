import { useState, useEffect } from 'react';
import { useAuth } from '@homeschool/shared';
import logo from '@homeschool/shared/assets/logo.png';
import SignIn              from './components/SignIn';
import BottomNav           from './components/BottomNav';
import OnboardingFlow      from './components/OnboardingFlow';
import HomeTab             from './tabs/HomeTab';
import PlannerTab          from './tabs/PlannerTab';
import AcademicRecordsTab  from './tabs/AcademicRecordsTab';
import SettingsTab         from './tabs/SettingsTab';
import { useSettings }     from './tools/planner/hooks/useSettings.js';
import { useStudents }     from './hooks/useStudents.js';
import { useDarkMode }     from './hooks/useDarkMode.js';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  // plannerStudent stores a studentId. Lifted here so the desktop sidebar
  // can show a student selector when the planner tab is active.
  const [plannerStudent, setPlannerStudent] = useState('');
  const { students, loading: studentsLoading } = useStudents(user?.uid);
  const { subjectsByStudent } = useSettings(user?.uid, plannerStudent);
  useEffect(() => { if (!plannerStudent && students.length > 0) setPlannerStudent(students[0].studentId); }, [students, plannerStudent]);
  // Dark-mode state lives at the shell so the Settings tab (and the
  // BottomNav sidebar, if ever needed again) can share a single source
  // of truth. The hook writes to `localStorage.color-mode` and the
  // <html data-mode> attribute, so any other useDarkMode subscriber
  // stays in sync automatically.
  const { mode: colorMode, toggle: toggleDarkMode } = useDarkMode();

  if (loading) return null;
  if (!user)   return <SignIn />;

  if (studentsLoading) return (
    <div className="app-loading">
      <img src={logo} alt="ILA" />
      <div className="app-loading-dots">
        <span /><span /><span />
      </div>
    </div>
  );

  if (students.length === 0) return (
    <OnboardingFlow uid={user.uid} onComplete={() => {}} />
  );

  return (
    <div className="app-shell">
      <div className="shell-content">
        {activeTab === 'home'     && <HomeTab />}
        {activeTab === 'planner'  && (
          <PlannerTab
            student={plannerStudent}
            setStudent={setPlannerStudent}
            students={students}
            subjectsByStudent={subjectsByStudent}
          />
        )}
        {activeTab === 'academic' && <AcademicRecordsTab />}
        {activeTab === 'settings' && (
          <SettingsTab
            user={user}
            colorMode={colorMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )}
      </div>
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        students={students}
        activeStudent={plannerStudent}
        onStudentChange={setPlannerStudent}
      />
    </div>
  );
}
