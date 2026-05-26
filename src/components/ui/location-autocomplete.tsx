import { useEffect, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { fetchSuggestions } from '../../lib/places';

interface LocationAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  /** Visual variant: 'light' boxed, 'glass' dark hero, 'underline' bottom-border form */
  variant?: 'light' | 'glass' | 'underline';
}

// Local fallback list (Australian suburbs / landmarks) — used when no Google key.
const FALLBACK_LOCATIONS = [
  'Melbourne CBD, VIC', 'Melbourne Airport (MEL), VIC', 'Southbank, VIC', 'Docklands, VIC',
  'St Kilda, VIC', 'Richmond, VIC', 'South Yarra, VIC', 'Carlton, VIC', 'Fitzroy, VIC',
  'Brunswick, VIC', 'Footscray, VIC', 'Box Hill, VIC', 'Glen Waverley, VIC', 'Dandenong, VIC',
  'Frankston, VIC', 'Geelong, VIC', 'Epping, VIC', 'Craigieburn, VIC', 'Werribee, VIC',
  'Sydney CBD, NSW', 'Sydney Airport (SYD), NSW', 'Parramatta, NSW', 'Bondi, NSW',
  'Brisbane CBD, QLD', 'Brisbane Airport (BNE), QLD', 'Gold Coast, QLD',
  'Perth CBD, WA', 'Perth Airport (PER), WA', 'Adelaide CBD, SA', 'Adelaide Airport (ADL), SA',
  'Canberra, ACT', 'Hobart, TAS', 'Darwin, NT',
];

const fuse = new Fuse(FALLBACK_LOCATIONS, {
  threshold: 0.4,
  distance: 100,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

export function LocationAutocomplete({
  id,
  value,
  onChange,
  placeholder,
  error,
  className = '',
  variant = 'light',
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number>(0);
  const reqIdRef = useRef(0);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const querySuggestions = async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const reqId = ++reqIdRef.current;
    const remote = await fetchSuggestions(q);
    // Ignore stale responses
    if (reqId !== reqIdRef.current) return;
    const res = remote.length > 0 ? remote : fuse.search(q).map((r) => r.item).slice(0, 6);
    setSuggestions(res);
    setOpen(res.length > 0);
  };

  const handleChange = (v: string) => {
    onChange(v);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => querySuggestions(v), 200);
  };

  const pick = (s: string) => {
    onChange(s);
    setSuggestions([]);
    setOpen(false);
  };

  const inputCls =
    variant === 'glass'
      ? 'w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none'
      : variant === 'underline'
        ? `w-full bg-transparent border-b ${error ? 'border-red-300' : 'border-zinc-200'} py-4 text-brand-blue placeholder:text-zinc-400 focus:border-brand-blue outline-none transition-colors text-sm`
        : `w-full border ${error ? 'border-red-300' : 'border-gray-300'} rounded-md px-4 py-3.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent text-sm placeholder:text-gray-400`;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        placeholder={placeholder}
        autoComplete="off"
        className={inputCls}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-zinc-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => pick(s)}
                className="w-full text-left px-4 py-3 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 flex items-center gap-2"
              >
                <iconify-icon icon="solar:map-point-linear" width="15" class-name="text-brand-orange shrink-0"></iconify-icon>
                <span>{s}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{error}</span>}
    </div>
  );
}
