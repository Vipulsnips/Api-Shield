const cron = require("node-cron");
const axios = require("axios");
const Service = require("../models/service");
cron.schedule("*/5 * * * *", async () => {
  try {
    const services = await Service.find({});


    await Promise.allSettled(
      services.map(async (service) => {
        await Promise.allSettled(
          service.instances.map(async (instance) => {
            try {
              await axios.get(instance.url, {
                timeout: 3000,
                validateStatus: () => true,
              });
              instance.healthStatus = "healthy";
            } catch {
              instance.healthStatus = "unhealthy";
            }
            instance.lastChecked = new Date();
          }),
        );
        await service.save();
      }),
    );

    console.log(`Health check completed for ${services.length} services`);
  } catch (err) {
    console.error("Health check job failed:", err.message);
  }
});
