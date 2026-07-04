const net = require("net");
function isPrivateIPv4(ip) {
  const parts = ip.split(".");
  // Private Class A
  if (parts[0] === 10) return true;

  // Private Class B
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

  // Private Class C
  if (parts[0] === 192 && parts[1] === 168) return true;

  // Link-local (includes AWS metadata range)
  if (parts[0] === 169 && parts[1] === 254) return true;
  return false;
}
function validateServiceUrl(url) {
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      valid: false,
      message: "Invalid URL",
    };
  }
  if (!["https:", "http:"].includes(parsedUrl.protocol)) {
    return {
      valid: false,
      message: "Only HTTP and HTTPS URLs are allowed",
    };
  }
  const hostname = parsedUrl.hostname;
  if (
    hostname === "localhost" ||
    //ipv4 this computer ip
    hostname === "127.0.0.1" ||
    //ipv6 this computer ip
    hostname === "::1"
  ) {
    return {
      valid: false,
      message: "Localhost URLs are not allowed",
    };
  }
  if (net.isIP(hostname) === 4 && isPrivateIPv4(hostname)) {
    return {
      valid: false,
      message: "Private IP addresses are not allowed",
    };
  }

  return {
    valid: true,
  };
}
module.exports = validateServiceUrl;
