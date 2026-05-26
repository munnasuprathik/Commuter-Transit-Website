import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
  id: number;
  booking_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_location: string;
  destination_location: string;
  pickup_date: string;
  pickup_time: string;
  service_type: string;
  driver_preference: string;
  special_instructions: string;
  trip_type?: string;
  return_date?: string;
  return_time?: string;
  created_at: string;
}

interface Contact {
  id: number;
  contact_reference: string;
  sender_name: string;
  sender_email: string;
  message_content: string;
  created_at: string;
}

export function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'contacts'>('bookings');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoggedIn(true);
      fetchData(token);
    }
  }, []);

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      const [bookingsRes, contactsRes] = await Promise.all([
        fetch('/api/admin/bookings', { headers: { 'X-Admin-Token': token } }),
        fetch('/api/admin/contacts', { headers: { 'X-Admin-Token': token } })
      ]);

      if (bookingsRes.ok && contactsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const contactsData = await contactsRes.json();
        setBookings(bookingsData);
        setContacts(contactsData);
      } else {
        localStorage.removeItem('admin_token');
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setIsLoggedIn(true);
        fetchData(data.token);
      } else {
        setError(data.message || 'Invalid password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    setBookings([]);
    setContacts([]);
  };

  const handleDelete = async (id: number, type: 'bookings' | 'contacts') => {
    if (!window.confirm(`Are you sure you want to delete this ${type === 'bookings' ? 'booking' : 'contact request'}?`)) {
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token }
      });

      if (res.ok) {
        if (type === 'bookings') {
          setBookings(prev => prev.filter(b => b.id !== id));
        } else {
          setContacts(prev => prev.filter(c => c.id !== id));
        }
      } else {
        alert('Failed to delete entry.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('An error occurred while deleting.');
    }
  };

  const exportToCSV = () => {
    const dataToExport = activeTab === 'bookings' ? bookings : contacts;
    if (dataToExport.length === 0) return;

    const headers = Object.keys(dataToExport[0]);
    const csvRows = [
      headers.join(','),
      ...dataToExport.map(row => 
        headers.map(fieldName => {
          const value = (row as any)[fieldName];
          const stringValue = value === null || value === undefined ? '' : String(value);
          // Escape quotes and wrap in quotes if contains comma
          return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBookings = bookings.filter(b => 
    b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.destination_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(c => 
    c.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.sender_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.message_content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalBookings: bookings.length,
    totalContacts: contacts.length,
    bookingsToday: bookings.filter(b => {
      const today = new Date().toISOString().split('T')[0];
      return b.created_at.startsWith(today);
    }).length
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border border-zinc-200 p-8 rounded-3xl shadow-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-brand-blue flex items-center justify-center rounded-full p-2">
              <img src="/images/CT LOGO WHITE.png" alt="Commuter Transit" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-medium text-brand-blue tracking-tight">Admin Access</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-brand-blue focus:border-brand-blue outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full py-4 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-orange-light transition-colors"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="h-12 md:h-14 flex items-center">
              <img src="/images/CT LOGO.png" alt="Commuter Transit" className="h-full w-auto object-contain" />
            </div>
            <div className="border-l border-zinc-300 pl-4">
              <h1 className="text-2xl font-medium tracking-tight text-brand-blue">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={exportToCSV}
              className="px-6 py-3 bg-white border border-zinc-200 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-50 transition-all flex items-center gap-2 text-brand-blue shadow-sm"
              title="Export to CSV"
            >
              <iconify-icon icon="solar:download-linear" width="16"></iconify-icon>
              <span>Export</span>
            </button>
            <button
              onClick={() => fetchData(localStorage.getItem('admin_token') || '')}
              className="p-3 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 transition-colors text-brand-blue shadow-sm"
              title="Refresh Data"
            >
              <iconify-icon icon="solar:refresh-linear" width="20"></iconify-icon>
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-white border border-zinc-200 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all text-brand-blue shadow-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-brand-blue/5 rounded-full flex items-center justify-center text-brand-blue">
                <iconify-icon icon="solar:calendar-bold" width="16"></iconify-icon>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Bookings</span>
            </div>
            <div className="text-3xl font-medium tracking-tight text-brand-blue">{stats.totalBookings}</div>
          </div>
          <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-brand-blue/5 rounded-full flex items-center justify-center text-brand-blue">
                <iconify-icon icon="solar:chat-round-dots-bold" width="16"></iconify-icon>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Contacts</span>
            </div>
            <div className="text-3xl font-medium tracking-tight text-brand-blue">{stats.totalContacts}</div>
          </div>
          <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange">
                <iconify-icon icon="solar:star-bold" width="16"></iconify-icon>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Bookings Today</span>
            </div>
            <div className="text-3xl font-medium tracking-tight text-brand-blue">{stats.bookingsToday}</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-brand-blue text-white' : 'bg-white border border-zinc-200 text-zinc-500 hover:text-brand-blue'}`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'contacts' ? 'bg-brand-blue text-white' : 'bg-white border border-zinc-200 text-zinc-500 hover:text-brand-blue'}`}
            >
              Contacts ({contacts.length})
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <iconify-icon icon="solar:magnifer-linear" width="18"></iconify-icon>
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-full pl-12 pr-6 py-3 text-xs text-brand-blue focus:border-brand-blue outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-8 h-8 border-2 border-zinc-200 border-t-brand-orange rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Loading Data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'bookings' ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50 whitespace-nowrap">
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ref</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Created</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Customer</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phone</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">From</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">To</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pickup Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Time</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Service</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Driver</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Instructions</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr><td colSpan={13} className="px-6 py-20 text-center text-zinc-400 italic">No bookings found.</td></tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors group whitespace-nowrap">
                          <td className="px-6 py-4">
                            <div className="text-[10px] text-brand-blue font-mono bg-zinc-100 px-2 py-1 rounded">{booking.booking_reference}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[10px] text-zinc-500">{new Date(booking.created_at).toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-medium text-brand-blue">{booking.customer_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-zinc-500">{booking.customer_email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-zinc-500">{booking.customer_phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-zinc-700 max-w-[150px] truncate" title={booking.pickup_location}>{booking.pickup_location}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-zinc-700 max-w-[150px] truncate" title={booking.destination_location}>{booking.destination_location}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-zinc-700">{booking.pickup_date}</div>
                            {booking.trip_type === 'return' && (
                              <div className="text-[10px] text-brand-orange font-bold uppercase tracking-widest mt-1">↩ Return: {booking.return_date}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-zinc-700">{booking.pickup_time}</div>
                            {booking.trip_type === 'return' && booking.return_time && (
                              <div className="text-[10px] text-brand-orange mt-1">{booking.return_time}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-block px-2 py-1 bg-brand-blue/5 rounded text-[10px] font-bold uppercase tracking-widest text-brand-blue">
                              {booking.service_type.replace('-', ' ')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{(booking.driver_preference || 'with-driver').replace('-', ' ')}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-zinc-500 max-w-[200px] truncate" title={booking.special_instructions}>
                              {booking.special_instructions || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDelete(booking.id, 'bookings')}
                              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                              title="Delete Booking"
                            >
                              <iconify-icon icon="solar:trash-bin-trash-linear" width="16"></iconify-icon>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50">
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date/Ref</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sender</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Message</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-20 text-center text-zinc-400 italic">No contact requests found.</td></tr>
                    ) : (
                      filteredContacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-xs font-medium text-brand-blue">{new Date(contact.created_at).toLocaleDateString()}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">{contact.contact_reference}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-medium text-brand-blue">{contact.sender_name}</div>
                            <div className="text-[10px] text-zinc-400">{contact.sender_email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-zinc-600 leading-relaxed max-w-xl">{contact.message_content}</p>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDelete(contact.id, 'contacts')}
                              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                              title="Delete Contact"
                            >
                              <iconify-icon icon="solar:trash-bin-trash-linear" width="16"></iconify-icon>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
