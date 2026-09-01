import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, record }) {
  if (!isOpen || !record) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content crud-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '24px' }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626'
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--navy-950)' }}>Hapus Data Evaluasi</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--ink-400)' }}>Konfirmasi tindakan penghapusan</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ margin: '20px 0', fontSize: '14px', color: 'var(--ink-600)', lineHeight: '1.6' }}>
          Apakah Anda yakin ingin menghapus data evaluasi untuk vendor <strong style={{ color: 'var(--navy-950)' }}>"{record.vendor}"</strong> pada event <strong style={{ color: 'var(--navy-950)' }}>"{record.event}"</strong>?
          <div style={{ marginTop: '10px', fontSize: '12.5px', color: '#DC2626', background: '#FEF2F2', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
            ⚠️ Data yang telah dihapus tidak dapat dikembalikan.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ background: '#DC2626', borderColor: '#DC2626', color: '#ffffff' }}
            onClick={() => {
              onConfirm(record.id);
              onClose();
            }}
          >
            <Trash2 size={15} /> Ya, Hapus Data
          </button>
        </div>
      </div>
    </div>
  );
}
