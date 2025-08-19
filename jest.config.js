// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["**/**/*.test.ts"], // Automatically find test files ending in .test.ts
	collectCoverageFrom: [
		"src/**/*.ts",
		"!src/**/*.test.ts",
		"!src/types/**",
		"!src/constants/**",
		"!src/index.ts",
	],
	coverageDirectory: "coverage",
	coverageReporters: ["text", "lcov", "html"],
	setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
	verbose: true,
	forceExit: true,
	clearMocks: true, // Optional: Automatically clear mock calls and instances between every test
	// testTimeout: 10000,
};
