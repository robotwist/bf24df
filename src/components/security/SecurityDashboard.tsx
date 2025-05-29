import React from 'react';

interface SecurityDashboardProps {
  isDemoMode: boolean;
}

const SecurityDashboard = ({ isDemoMode }: SecurityDashboardProps): JSX.Element => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Security Dashboard</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">API Security Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>API Key Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>SSL/TLS</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Enabled
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Access Control</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Demo Mode</span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                isDemoMode 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {isDemoMode ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rate Limiting</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Data Protection</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Data Encryption</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Enabled
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Data Masking</span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                isDemoMode 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isDemoMode ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SecurityDashboard }; 