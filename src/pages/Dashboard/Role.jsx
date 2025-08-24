// filepath: f:\programming\darzi_flow\darzi_flow_frontend\src\pages\Dashboard\Role.jsx
import { useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';

const roleUsers = {
  admin: [
    { name: 'Admin User 1', email: 'admin1@example.com', role: 'Admin' },
    { name: 'Admin User 2', email: 'admin2@example.com', role: 'Admin' },
  ],
  supervisor: [
    { name: 'Supervisor User 1', email: 'supervisor1@example.com', role: 'Supervisor' },
    { name: 'Supervisor User 2', email: 'supervisor2@example.com', role: 'Supervisor' },
  ],
  qa: [
    { name: 'QA User 1', email: 'qa1@example.com', role: 'QA' },
    { name: 'QA User 2', email: 'qa2@example.com', role: 'QA' },
  ],
};

const roleColors = {
  Moderator: 'bg-blue-100 text-blue-700',
  Admin: 'bg-green-100 text-green-700',
  Supervisor: 'bg-blue-100 text-blue-700',
  QA: 'bg-yellow-100 text-yellow-700',
};

export default function Role() {
  const { role } = useParams();
  const users = roleUsers[role] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-8 px-4 mx-auto max-w-3xl">
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl shadow-lg p-6 w-full border border-blue-100 mt-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
            {role.charAt(0).toUpperCase() + role.slice(1)} Users
          </h2>
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
                {users.length > 0 ? (
                  users.map((user, idx) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500">
                      No users found for this role.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}