// import dotenv from "dotenv";
// dotenv.config();

const config = {
	JWT_SECRET: process.env.JWT_SECRET || "test-token-secret",
	CLIENT_ID: process.env.REACT_APP_CLIENT_ID || "test-client-123",
};

export default config;
