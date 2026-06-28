import API from "../services/api";
import { useState, useEffect } from "react";
import ServiceCard from "../components/ServiceCard";
import toast from "react-hot-toast";
function Services() {
  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  async function getServices() {
    setLoading(true);
    try {
      const response = await API.get("/services/me");
      setMyServices(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }
  async function getApiKeys() {
    try {
      const response = await API.get("/apiKeys");
      setApiKeys(response.data);
    } catch (err) {
      console.log(err);
    }
  }
  function updateHealthStatus(serviceId, healthStatus) {
    setMyServices(
      myServices.map((service) => {
        if (service._id === serviceId) {
          return {
            ...service,
            healthStatus,
          };
        }

        return service;
      }),
    );
  }

  useEffect(() => {
    getServices();
    getApiKeys();
  }, []);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <h2 className="text-2xl font-semibold text-gray-600">
          Loading services...
        </h2>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">My Services</h1>

        {myServices.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <h2 className="text-xl font-semibold">No Services Yet</h2>

            <p className="text-gray-500 mt-2">
              Create your first service to start using APIShield.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {myServices.map((service) => {
              const currentApiKeys = apiKeys.filter((curr) => {
                return curr.service.toString() === service._id.toString();
              });

              return (
                <ServiceCard
                  key={service._id}
                  service={service}
                  apiKeys={currentApiKeys}
                  onApiKeyChanged={getApiKeys}
                  onServiceChanged={getServices}
                  updateHealthStatus={updateHealthStatus}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default Services;
