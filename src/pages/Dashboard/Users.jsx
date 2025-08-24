// src/pages/Dashboard/Users.jsx
import Navbar from '../../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';

const users = [
  { name: 'Moderator User', email: 'moderator@example.com', role: 'Moderator' },
  { name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
  { name: 'QA User', email: 'qa@example.com', role: 'QA' },
  // Add more users as needed
  { name: 'Moderator User', email: 'moderator@example.com', role: 'Moderator' },
  { name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
  { name: 'QA User', email: 'qa@example.com', role: 'QA' },
  { name: 'Moderator User', email: 'moderator@example.com', role: 'Moderator' },
  { name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
  { name: 'QA User', email: 'qa@example.com', role: 'QA' },
  { name: 'Moderator User', email: 'moderator@example.com', role: 'Moderator' },
  { name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
  { name: 'QA User', email: 'qa@example.com', role: 'QA' },
];

const roleColors = {
  Moderator: 'bg-blue-100 text-blue-700',
  Admin: 'bg-green-100 text-green-700',
  QA: 'bg-yellow-100 text-yellow-700',
};

export default function Users() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-8 px-4 mx-auto max-w-7xl">
        {/* Table container with full width */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl shadow-lg p-6 w-full border border-blue-100 mt-8 mb-8">
          <div className="overflow-x-auto w-full">
            <table className="w-full bg-white rounded-lg shadow user-card-table">
              <thead>
                <tr className="bg-blue-600 text-white font-bold">
                  <th className="p-4 border-r-2 border-blue-400 border-b-2 border-blue-400 w-[30%]">Name</th>
                  <th className="p-4 border-r-2 border-blue-400 border-b-2 border-blue-400 w-[50%]">Email</th>
                  <th className="p-4 border-b-2 border-blue-400 w-[20%]">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.email + idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100'}
                  >
                    <td className="p-4 border-r border-blue-200 border-b border-blue-200 font-medium text-gray-800">
                      {user.name}
                    </td>
                    <td className="p-4 border-r border-blue-200 border-b border-blue-200 text-gray-600">
                      {user.email}
                    </td>
                    <td className="p-4 border-b border-blue-200">
                      <span className={`inline-block px-3 py-1 rounded-full font-semibold ${roleColors[user.role] || 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Centered Back to Dashboard button */}
        <div className="flex justify-center w-full mt-8 mb-16">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

