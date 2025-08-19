// middlewares/jsonValidationMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { validateSchemaForAction } from "../services/schema-service";
import logger from "../utils/logger";
import { getLoggerMeta } from "../utils/utility";
import { sendError } from "../utils/resUtils";

const fileValidationLogger = logger.child("file-validation-controller");
/**
 * Schema validation controller for uploaded JSON payloads
 * @returns Validated JSON payloads in req.validatedPayloads (req object of Express)
 */
export const schemaValidator = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// Use processedJsonPayloads if present (from upload), else req.body.payloads (from API)

	try {
		const payloads = (req as any).processedJsonPayloads || undefined;

		if (!payloads) {
			return sendError(res, "VALIDATION_FAILED", "No payloads to validate");

			// return res.status(400).json({ error: "No payloads to validate" });
		}

		const validated: any[] = [];
		const errors: { filename: string; error: string }[] = [];

		payloads.forEach((item: { filename: string; payload: any }) => {
			const { filename, payload } = item;
			try {
				const action = payload.context?.action;
				if (!action) {
					errors.push({
						filename: filename,
						error:
							"context.action is required for validation <check uploaded payload(s)>",
					});
					//   return res.status(400).json({
					//     error:
					//       "context.action is required for validation <check uploaded payloads>",
					//   });
				}
				fileValidationLogger.info(
					`Validating payload for filename:${filename} & action: ${action}`,
					getLoggerMeta(req),
				);
				const { valid, schemaErrors } = validateSchemaForAction(
					payload,
					action,
					getLoggerMeta(req),
				);

				if (!valid) {
					logger.error("schema validation failed", {
						...getLoggerMeta(req),
						errors: errors,
					});
					errors.push({ filename: filename, error: schemaErrors });
					//   res.status(422).json({
					//     message: "schema validation failed",
					//     errors: errors,
					//   });
					//   return;
				} else {
					validated.push(payload);
					logger.info("schema validation passed", getLoggerMeta(req));
				}
			} catch (error) {
				fileValidationLogger.error(
					"Error in schema validation",
					getLoggerMeta(req),
					error,
				);
				errors.push({
					filename: filename,
					error: error instanceof Error ? error.message : "Unknown error",
				});
				// return res.status(400).json({
				//   message: "Some error occurred during schema validation",
				//   invalidFiles: errors,
				// });
			}
		});

		fileValidationLogger.info(
			"saving validated payloads",
			getLoggerMeta(req),
			validated,
		);

		(req as any).validatedPayloads = validated;
		// Clean up processed JSON to avoid misuse or memory leak
		delete (req as any).processedJsonPayloads;

		if (errors.length) {
			return sendError(res, "SCHEMA_VALIDATION_FAILED", undefined, errors);

			// return res.status(422).json({
			// 	message: "Schema Validation failed",
			// 	details: errors,
			// });
		}
		next();
	} catch (error) {
		fileValidationLogger.error(
			"Error in schema validation",
			getLoggerMeta(req),
			error,
		);

		return sendError(res, "INTERNAL_ERROR", undefined, {
			error: error instanceof Error ? error.message : String(error),
		});
		// return

		// res.status(500).json({
		// 	error: "Internal server error during schema validation",
		// 	details:
		// });
	}
};
