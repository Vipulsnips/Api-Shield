const cron = require("node-cron");
const axios = require("axios");
const Service = require("../models/service");

cron.schedule("*/5 * * * *", async () => {
  const services = await Service.find({});
  for (const service of services) {
    try {
      await axios.get(service.baseurl);
      service.healthStatus = "healthy";
    } catch {
      service.healthStatus = "unhealthy";
    }
    service.lastChecked = new Date();
    await service.save();
  }
  console.log(`Health check completed for ${services.length} services`);
});
