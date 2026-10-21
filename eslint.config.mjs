import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      "@next/next/no-img-element": "off", // Izinkan data-URL base64 untuk render canvas KTA & avatar
    },
  },
];

export default eslintConfig;
