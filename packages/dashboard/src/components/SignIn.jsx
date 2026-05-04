import { useState } from 'react';
import { signInWithGoogle } from '@homeschool/shared';
import logo from '@homeschool/shared/assets/logo.png';
import { useSchoolSettings } from '../hooks/useSchoolSettings.js';
import './SignIn.css';

export default function SignIn() {
  const [error, setError] = useState('');
  const { schoolName, tagline } = useSchoolSettings(null);
  const parts = schoolName.split(' ');
  const line1 = parts[0];
  const line2 = parts.slice(1).join(' ');

  async function handleSignIn() {
    setError('');
    try {
      await signInWithGoogle();
    } catch {
      setError('Sign-in failed. Please try again.');
    }
  }

  return (
    <div className="signin">
      <div className="signin-card">
        <img src={logo} alt="ILA" className="signin-logo" />
        <div className="signin-school">
          <span className="signin-school-line1">{line1}</span>
          {line2 && <span className="signin-school-line2">{line2}</span>}
          {tagline && <span className="signin-school-tagline">{tagline}</span>}
        </div>
        <button className="signin-btn" onClick={handleSignIn}>
          Sign in with Google
        </button>
        {error && <p className="signin-error">{error}</p>}
      </div>
    </div>
  );
}
