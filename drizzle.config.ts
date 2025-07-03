export default {
    dialect: "postgresql",
  schema: "./config/schema.ts",   // Make sure the path is correct for your project
  out: "./drizzle",

  dbCredentials: {
  url: "postgresql://practic_owner:npg_3xkmb9DXiqwO@ep-snowy-star-a8f3g264-pooler.eastus2.azure.neon.tech/practic?sslmode=require&channel_binding=require"
  }
};
