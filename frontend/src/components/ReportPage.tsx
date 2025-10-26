import React, { useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';

const ReportPage: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reports, setReports] = useState<any[]>([]);

  const downloadReport = async () => {
    if (!keycloak?.token) {
      setError('Not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/reports`, {
        headers: {
          'Authorization': `Bearer ${keycloak.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReports(data.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <button
          onClick={() => keycloak.login()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Usage Reports</h1>
        
        <button
          onClick={downloadReport}
          disabled={loading}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Loading Reports...' : 'Load Reports'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {reports.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Your Reports</h2>
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{report.patient_name}</h3>
                      <p className="text-gray-600">Device: {report.device_id}</p>
                      <p className="text-gray-600">Type: {report.prosthesis_type}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Battery Level:</span> {report.avg_battery_level}%</p>
                      <p><span className="font-medium">Response Time:</span> {report.avg_response_time}ms</p>
                      <p><span className="font-medium">Usage Duration:</span> {report.total_usage_duration}min</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Last Activity: {new Date(report.last_activity_ts).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;