import React, { useState, useEffect } from 'react';
import { Users, BookOpen, CreditCard, LayoutDashboard, Plus, Search, Filter, Menu, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const App = () => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useState(JSON.parse(localStorage.getItem('students')) || []);
  const [courses, setCourses] = useState(JSON.parse(localStorage.getItem('courses')) || [
    { id: 1, name: 'Mathematics', fee: 500 },
    { id: 2, name: 'Science', fee: 450 }
  ]);
  const [fees, setFees] = useState(JSON.parse(localStorage.getItem('fees')) || []);

  // Filters
  const [feeFilter, setFeeFilter] = useState({ method: 'all', month: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Persist Data
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('courses', JSON.stringify(courses));
    localStorage.setItem('fees', JSON.stringify(fees));
  }, [students, courses, fees]);

  // --- Logic Helpers ---
  const addStudent = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newStudent = {
      id: Date.now(),
      name: formData.get('name'),
      courseId: formData.get('courseId'),
      phone: formData.get('phone'),
      joinedDate: new Date().toLocaleDateString()
    };
    setStudents([...students, newStudent]);
    e.target.reset();
  };

  const addFee = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newFee = {
      id: Date.now(),
      studentId: formData.get('studentId'),
      amount: formData.get('amount'),
      month: formData.get('month'), // e.g., "2023-10"
      method: formData.get('method'),
      date: new Date().toLocaleDateString()
    };
    setFees([...fees, newFee]);
    e.target.reset();
  };

  const getStudentName = (id) => students.find(s => s.id.toString() === id.toString())?.name || 'Unknown';

  const filteredFees = fees.filter(f => {
    const matchesMethod = feeFilter.method === 'all' || f.method === feeFilter.method;
    const matchesSearch = getStudentName(f.studentId).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  // --- Components ---
  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center border-b shadow-sm">
        <h1 className="font-bold text-blue-600 text-xl">ClassManager</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu /></button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'fixed inset-0 z-50 bg-white' : 'hidden'} md:block w-full md:w-64 border-r bg-white p-4 space-y-2`}>
        <div className="hidden md:block mb-8 px-2">
          <h1 className="font-bold text-blue-600 text-2xl tracking-tight">ClassManager</h1>
        </div>
        <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
        <SidebarItem id="students" icon={Users} label="Students" />
        <SidebarItem id="courses" icon={BookOpen} label="Courses" />
        <SidebarItem id="fees" icon={CreditCard} label="Fee Records" />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500">Total Students</p>
                <h3 className="text-3xl font-bold">{students.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500">Monthly Revenue</p>
                <h3 className="text-3xl font-bold text-green-600">
                  ${fees.reduce((acc, curr) => acc + Number(curr.amount), 0)}
                </h3>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-4">Earnings Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fees.slice(-5)}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Student Management */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold mb-4 flex items-center"><Plus className="mr-2"/> Add Student</h2>
              <form onSubmit={addStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input name="name" placeholder="Full Name" required className="p-2 border rounded" />
                <input name="phone" placeholder="Phone Number" required className="p-2 border rounded" />
                <select name="courseId" className="p-2 border rounded">
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button className="bg-blue-600 text-white py-2 rounded font-bold">Add Student</button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="border-b">
                      <td className="p-4 font-medium">{s.name}</td>
                      <td className="p-4">{s.phone}</td>
                      <td className="p-4">{s.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fee Management */}
        {activeTab === 'fees' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold mb-4">Collect Fee</h2>
              <form onSubmit={addFee} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <select name="studentId" className="p-2 border rounded">
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="month" name="month" required className="p-2 border rounded" />
                <input type="number" name="amount" placeholder="Amount" required className="p-2 border rounded" />
                <select name="method" className="p-2 border rounded">
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </select>
                <button className="bg-green-600 text-white py-2 rounded font-bold">Record Payment</button>
              </form>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  placeholder="Search student..." 
                  className="pl-10 p-2 border rounded-lg w-full"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter size={18} className="text-gray-500" />
                <select 
                  className="p-2 border rounded-lg"
                  onChange={(e) => setFeeFilter({...feeFilter, method: e.target.value})}
                >
                  <option value="all">All Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Month</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map(f => (
                    <tr key={f.id} className="border-b">
                      <td className="p-4">{getStudentName(f.studentId)}</td>
                      <td className="p-4">{f.month}</td>
                      <td className="p-4 font-bold text-blue-600">${f.amount}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${f.method === 'Online' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                          {f.method}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;