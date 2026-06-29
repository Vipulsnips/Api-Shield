import API from "../services/api";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  KeyIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ServerStackIcon,
} from "@heroicons/react/24/outline";
function ServiceCard({
  service,
  apiKeys,
  onApiKeyChanged,
  onServiceChanged,
  updateHealthStatus,
}) {
  const [analytics, setAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [logs, setLogs] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [gatewaySecret, setGatewaySecret] = useState(null);
  const [showGatewaySecret, setShowGatewaySecret] = useState(false);
  async function createApiKey() {
    try {
      await API.post(`/apiKeys/${service._id}`);
      await onApiKeyChanged();
      toast.success("API Key created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }
  async function deleteApiKey(currApiKeyId) {
    try {
      await API.delete(`/apiKeys/${currApiKeyId}`);
      await onApiKeyChanged();
      toast.success("API Key deleted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }
  async function deleteService(serviceId) {
    try {
      await API.delete(`/services/${serviceId}`);
      await onServiceChanged();
      toast.success("Service deleted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }
  async function checkHealthStatus(serviceId) {
    try {
      const response = await API.post(`/services/${serviceId}/check-health`);
      await updateHealthStatus(serviceId, response.data.status);
      toast.success(`Service is ${response.data.status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }
  async function toggleAnalytics() {
    if (showAnalytics) {
      setShowAnalytics(false);
      return;
    }
    try {
      const response = await API.get(`/analytics/service/${service._id}`);
      setAnalytics(response.data);
      setShowAnalytics(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }
  async function toggleLogs() {
    if (showLogs) {
      setShowLogs(false);
      return;
    }
    try {
      const response = await API.get(`/analytics/service/${service._id}/logs`);
      setLogs(response.data);
      setShowLogs(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }
  async function toggleGatewaySecret() {
    if (showGatewaySecret) {
      setShowGatewaySecret(false);
      return;
    }

    if (gatewaySecret) {
      setShowGatewaySecret(true);
      return;
    }

    try {
      const response = await API.get(`/services/${service._id}/secret`);

      setGatewaySecret(response.data.gatewaySecret);
      setShowGatewaySecret(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to fetch gateway secret",
      );
    }
  }
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6 hover:shadow-xl transition">
      <div>
        <div className="flex items-center gap-3">
          <ServerStackIcon className="h-7 w-7 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">{service.name}</h2>
        </div>

        <p className="text-gray-600 mt-2">
          <span className="font-semibold">Slug:</span> {service.slug}
        </p>

        <p className="mt-1">
          <span className="font-semibold">Health:</span>{" "}
          <span
            className={`font-semibold ${
              service.healthStatus === "healthy"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            ● {service.healthStatus}
          </span>
        </p>
      </div>
      <hr />
      <div className="mt-4">
        <h4 className="font-semibold">Gateway Secret</h4>
        <div className="flex items-center gap-3 mt-2">
          <code className="bg-gray-100 px-3 py-2 rounded text-sm break-all flex-1">
            {showGatewaySecret ? gatewaySecret : "••••••••••••••••••••••••••••"}
          </code>

          <button
            onClick={toggleGatewaySecret}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
          >
            {showGatewaySecret ? "Hide" : "Show"}
          </button>

          <button
            disabled={!showGatewaySecret}
            onClick={() => {
              navigator.clipboard.writeText(gatewaySecret);
              toast.success("Gateway Secret Copied!");
            }}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded"
          >
            Copy
          </button>
        </div>
      </div>
      <hr />
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
          <KeyIcon className="h-5 w-5 text-yellow-500" />
          API Keys ({apiKeys.length})
        </h3>

        <ul className="space-y-2">
          {apiKeys.map((curr) => (
            <li
              key={curr._id}
              className="flex justify-between items-center border rounded-lg px-3 py-2"
            >
              <span className="truncate">{curr.key}</span>

              <button
                onClick={() => deleteApiKey(curr._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={createApiKey}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
      >
        Create API Key
      </button>
      <hr />
      <div>
        <button
          onClick={toggleAnalytics}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          {showAnalytics ? "Hide Analytics" : "Show Analytics"}
        </button>

        {showAnalytics && analytics && (
          <div className="mt-5 space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <ChartBarIcon className="h-5 w-5 text-blue-500" />
              Analytics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-500">Requests</p>
                <h4 className="text-2xl font-bold">
                  {analytics.totalRequests}
                </h4>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-500">Success</p>
                <h4 className="text-2xl font-bold text-green-600">
                  {analytics.successRequests}
                </h4>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-500">Failed</p>
                <h4 className="text-2xl font-bold text-red-600">
                  {analytics.failedRequests}
                </h4>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-500">Avg Response</p>
                <h4 className="text-2xl font-bold">
                  {analytics.avgResponseTime.toFixed(2)} ms
                </h4>
              </div>
            </div>

            <button
              onClick={toggleLogs}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              {showLogs ? "Hide Logs" : "Show Logs"}
            </button>

            {showLogs && logs && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                  Request Logs
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-3 py-2">Method</th>
                        <th className="border px-3 py-2">Path</th>
                        <th className="border px-3 py-2">Status</th>
                        <th className="border px-3 py-2">Response</th>
                      </tr>
                    </thead>

                    <tbody>
                      {logs.map((log) => (
                        <tr key={log._id}>
                          <td className="border px-3 py-2">{log.method}</td>

                          <td className="border px-3 py-2">{log.path}</td>

                          <td className="border px-3 py-2">{log.statusCode}</td>

                          <td className="border px-3 py-2">
                            {log.responseTime} ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <hr />
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => checkHealthStatus(service._id)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          Check Health
        </button>

        <button
          onClick={() => deleteService(service._id)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          Delete Service
        </button>
      </div>
    </div>
  );
}
export default ServiceCard;
