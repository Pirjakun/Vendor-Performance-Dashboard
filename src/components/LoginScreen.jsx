import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
import logoImg from '../assets/logo.png';

export function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (cleanEmail === 'ss@werkudara.com' && cleanPassword === 'werkudara88') {
        if (rememberMe) {
          localStorage.setItem('werkudara_auth', 'true');
          localStorage.setItem('werkudara_user', JSON.stringify({ email: cleanEmail, name: 'Eksekutif Werkudara' }));
        } else {
          sessionStorage.setItem('werkudara_auth', 'true');
          sessionStorage.setItem('werkudara_user', JSON.stringify({ email: cleanEmail, name: 'Eksekutif Werkudara' }));
        }
        setIsLoading(false);
        onLoginSuccess({ email: cleanEmail, name: 'Eksekutif Werkudara' });
      } else {
        setIsLoading(false);
        setError('Email atau kata sandi tidak sesuai. Silakan periksa kembali!');
      }
    }, 600);
  };

  const handleQuickDemoFill = () => {
    setEmail('ss@werkudara.com');
    setPassword('werkudara88');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #07152B 0%, #0F2A57 50%, #1E3A8A 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Background Decorative Circles */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '450px', height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 201, 0.25) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '550px', height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(111, 177, 240, 0.18) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Main Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        margin: '20px',
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(7, 21, 43, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '36px 32px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px', height: '64px',
            margin: '0 auto 14px auto',
            background: '#0F2A57',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(15, 42, 87, 0.3)',
            padding: '8px'
          }}>
            <img src={logoImg} alt="Werkudara Group" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <h2 style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: 800,
            color: '#0F2A57',
            letterSpacing: '-0.3px'
          }}>
            WERKUDARA GROUP
          </h2>
          <p style={{
            margin: '6px 0 0 0',
            fontSize: '13px',
            color: '#64748B',
            fontWeight: 500
          }}>
            Vendor Performance Monitoring System
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#991B1B',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, color: '#DC2626' }} />
            <div>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#334155',
              marginBottom: '6px'
            }}>
              Alamat Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: '#94A3B8'
              }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ss@werkudara.com"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  fontSize: '14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563C9'}
                onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#334155',
              marginBottom: '6px'
            }}>
              Kata Sandi (Password)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: '#94A3B8'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  fontSize: '14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563C9'}
                onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748B', display: 'flex', alignItems: 'center', padding: '4px'
                }}
                title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Demo Fill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            fontSize: '12.5px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#0F2A57', width: '15px', height: '15px' }}
              />
              Ingat Sesi Saya
            </label>

            <button
              type="button"
              onClick={handleQuickDemoFill}
              style={{
                background: 'none', border: 'none', color: '#2563C9',
                fontWeight: 700, cursor: 'pointer', fontSize: '12px', padding: 0
              }}
            >
              Isi Akun Demo ⚡
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '14.5px',
              fontWeight: 700,
              color: '#ffffff',
              background: isLoading ? '#94A3B8' : 'linear-gradient(135deg, #0F2A57 0%, #2563C9 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(15, 42, 87, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? (
              <span>Memproses Masuk...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Masuk Ke Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #E2E8F0',
          textAlign: 'center',
          fontSize: '11.5px',
          color: '#94A3B8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={14} style={{ color: '#10B981' }} />
          Sistem Keamanan Terintegrasi - Werkudara Group © 2026
        </div>
      </div>
    </div>
  );
}
