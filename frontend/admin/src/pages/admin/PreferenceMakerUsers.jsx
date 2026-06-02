import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import { Search, Filter, RefreshCw, Users } from 'lucide-react';

export default function PreferenceMakerUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all'); // 'all', 'free', 'premium'

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data, error } = await supabase
        .from('preference_maker_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching preference maker users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter and search
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.mobile || '').includes(searchQuery);

    const matchPlan =
      planFilter === 'all' ||
      (planFilter === 'free' && u.plan_type !== 'premium') ||
      (planFilter === 'premium' && u.plan_type === 'premium');

    return matchSearch && matchPlan;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', padding: '32px' }}>
        <Header title="Preference Maker Users" subtitle="Manage Preference Maker Candidate Profiles" />

        <div style={{
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          marginTop: '32px'
        }}>
          {/* Controls Bar */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', flex: '1 1 100%', marginBottom: '4px' }}>
              All Registered Candidates
            </h2>

            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 16px', borderRadius: '12px', flex: 1, minWidth: '240px' }}>
              <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search by name, email, or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#1e293b' }}
              />
            </div>

            {/* Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 16px', borderRadius: '12px' }}>
              <Filter size={18} color="#64748b" />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b', fontWeight: '500', cursor: 'pointer' }}
              >
                <option value="all">All Plans</option>
                <option value="free">Free Users</option>
                <option value="premium">Premium Users</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '10px 16px',
                borderRadius: '12px',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: '0.18s'
              }}
            >
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {/* User Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '600', width: '90px' }}>S.No.</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>Candidate Details</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>Mobile Number</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>NEET Info</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>Domicile & Course</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>Plan Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>Attempts Used</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>Payment Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>Date Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map((u, index) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    {/* Frontend Serial Number Column (using index + 1 instead of database ID) */}
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                      Row {index + 1}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{u.name || 'Candidate'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email || 'No Email'}</div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                      {u.mobile}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '13px', color: '#1e293b' }}>Score: <span style={{ fontWeight: '600' }}>{u.score || '—'}</span></div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Rank: <span style={{ fontWeight: '500' }}>{u.rank || '—'}</span></div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '13px', color: '#1e293b' }}>{u.domicile || '—'}</div>
                      <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600', background: '#f5f3ff', display: 'inline-block', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>
                        {u.course || 'MBBS'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        background: u.plan_type === 'premium' ? '#ecfdf5' : '#f1f5f9',
                        color: u.plan_type === 'premium' ? '#059669' : '#475569',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '12px',
                        textTransform: 'uppercase'
                      }}>
                        {u.plan_type || 'free'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                      {u.attempts_used} / {u.max_attempts}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        background: u.payment_status === 'paid' ? '#ecfdf5' : '#fff7ed',
                        color: u.payment_status === 'paid' ? '#059669' : '#ea580c',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '12px',
                        textTransform: 'uppercase'
                      }}>
                        {u.payment_status || 'unpaid'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      {loading ? 'Loading candidates list...' : 'No candidate profiles found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
