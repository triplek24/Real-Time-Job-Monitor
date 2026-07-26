import { useDebouncedValue } from '@/hooks/useDebounceValue';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Hoisted — created once at module load, not on every render
const inputStyle = {
  padding: '0.5rem 1rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '1rem',
};

const wrapperStyle = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem',
  padding: '1.5rem',
  background: '#fff',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
};

const resetButtonStyle = {
  padding: '0.5rem 1rem',
  background: '#f3f4f6',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 500,
};

export const JobFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [position, setPosition] = useState(searchParams.get('position') || '');
  const [experienceRange, setExperienceRange] = useState(searchParams.get('experienceRange') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  const debouncedSearch = useDebouncedValue(search, 500);

  useEffect(() => {
    const params: any = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (position) params.position = position;
    if (experienceRange) params.experienceRange = experienceRange;
    if (status) params.status = status;

    setSearchParams(params);
  }, [debouncedSearch, position, experienceRange, status, setSearchParams]);

  const handleReset = () => {
    setSearch('');
    setPosition('');
    setExperienceRange('');
    setStatus('');
    setSearchParams({});
  };

  return (
    <div style={wrapperStyle}>
      <input
        type="text"
        placeholder="🔍 Search jobs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ ...inputStyle, flex: 2 }}
      />

      <select value={position} onChange={(e) => setPosition(e.target.value)} style={inputStyle}>
        <option value="">All Positions</option>
        <option value="JUNIOR">Junior</option>
        <option value="MIDDLE">Middle</option>
        <option value="SENIOR">Senior</option>
        <option value="STAFF">Staff</option>
      </select>

      <select value={experienceRange} onChange={(e) => setExperienceRange(e.target.value)} style={inputStyle}>
        <option value="">All Experience</option>
        <option value="1-3">1-3 years</option>
        <option value="3-5">3-5 years</option>
        <option value="5-8">5-8 years</option>
        <option value="8-11">8+ years</option>
      </select>

      <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
        <option value="">All Status</option>
        <option value="QUEUED">Queued</option>
        <option value="PROCESSING">Processing</option>
        <option value="COMPLETED">Completed</option>
        <option value="FAILED">Failed</option>
      </select>

      <button onClick={handleReset} style={resetButtonStyle}>
        Reset
      </button>
    </div>
  );
};