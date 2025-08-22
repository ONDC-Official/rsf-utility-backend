import { ReconDbService } from "../services/recon-service";
import logger from "../utils/logger";
import { sendError, sendSuccess } from "../utils/resUtils";
import { Request, Response } from "express";
import { getLoggerMeta } from "../utils/utility";
import {
	GetReconsQuerySchema,
	MoveReconsBodySchema,
	UpdateReconSchema,
	UpdateReconType,
} from "../types/recon-params";
import { z } from "zod";
import { validateUserId } from "../types/user-id-type";
import { RsfOrchestratorService } from "../services/rsf-orchestrator-service";
import { ReconType } from "../schema/models/recon-schema";

const reconLogger = logger.child("recon-controller");

export class ReconController {
	constructor(
		private reconService: ReconDbService,
		private rsfOrchestratorService: RsfOrchestratorService,
	) {}

	/**
	 * Get recons for a user with filtering and pagination
	 */
	getRecons = async (req: Request, res: Response) => {
		try {
			reconLogger.info("Fetching recons", getLoggerMeta(req));

			const userId = req.params.userId;
			if (!validateUserId(userId)) {
				reconLogger.error("Valid User ID is required", getLoggerMeta(req));
				return sendError(res, "INVALID_QUERY_PARAMS", undefined, {
					message: "Valid User ID is required",
				});
			}

			const validationResult = GetReconsQuerySchema.safeParse(req.query);
			if (!validationResult.success) {
				reconLogger.error(
					"Invalid query parameters",
					getLoggerMeta(req),
					validationResult.error,
				);
				return sendError(res, "INVALID_QUERY_PARAMS", undefined, {
					message: "Invalid query parameters",
					errors: z.treeifyError(validationResult.error),
				});
			}

			const data = await this.reconService.getRecons(
				userId,
				validationResult.data,
			);

			reconLogger.info("Recons fetched successfully", getLoggerMeta(req));
			return sendSuccess(res, data, "Recons fetched successfully");
		} catch (error: any) {
			reconLogger.error("Error fetching recons", getLoggerMeta(req), error);
			return sendError(res, "INTERNAL_ERROR", undefined, {
				error: error.message,
			});
		}
	};

	/**
	 * Get a specific recon by user ID and order ID
	 */
	getReconById = async (req: Request, res: Response) => {
		try {
			reconLogger.info("Fetching recon by ID", getLoggerMeta(req));

			const userId = req.params.userId;
			const orderId = req.params.orderId;

			if (!validateUserId(userId)) {
				reconLogger.error("Valid User ID is required", getLoggerMeta(req));
				return sendError(res, "INVALID_QUERY_PARAMS", undefined, {
					message: "Valid User ID is required",
				});
			}

			if (!orderId || orderId.trim().length === 0) {
				reconLogger.error("Valid Order ID is required", getLoggerMeta(req));
				return sendError(res, "INVALID_QUERY_PARAMS", undefined, {
					message: "Valid Order ID is required",
				});
			}

			const data = await this.reconService.getReconById(userId, orderId);

			if (!data) {
				reconLogger.info("Recon not found", getLoggerMeta(req));
				return sendError(res, "INTERNAL_ERROR", "Recon not found", {
					message: `Recon for order ${orderId} not found for user ${userId}`,
				});
			}

			reconLogger.info("Recon fetched successfully", getLoggerMeta(req));
			return sendSuccess(res, data, "Recon fetched successfully");
		} catch (error: any) {
			reconLogger.error(
				"Error fetching recon by ID",
				getLoggerMeta(req),
				error,
			);
			return sendError(res, "INTERNAL_ERROR", undefined, {
				error: error.message,
			});
		}
	};

	moveReconsToReady = async (req: Request, res: Response) => {
		try {
			reconLogger.info("Moving recons to ready", getLoggerMeta(req));

			const userId = req.params.userId;
			if (!validateUserId(userId)) {
				reconLogger.error("Valid User ID is required", getLoggerMeta(req));
				return sendError(res, "INVALID_QUERY_PARAMS", undefined, {
					message: "Valid User ID is required",
				});
			}
			const validationResult = MoveReconsBodySchema.safeParse(req.body);
			if (!validationResult.success) {
				reconLogger.error(
					"Invalid body parameters",
					getLoggerMeta(req),
					validationResult.error,
				);
				return sendError(res, "INVALID_REQUEST_BODY", undefined, {
					message: "Invalid body parameters",
					errors: z.treeifyError(validationResult.error),
				});
			}
			const data = await this.rsfOrchestratorService.moveReconsToReady(
				userId,
				validationResult.data,
			);
			reconLogger.info(
				"Recons moved to ready successfully",
				getLoggerMeta(req),
			);
			return sendSuccess(res, data, "Recons moved to ready successfully");
		} catch (error: any) {
			reconLogger.error("Error moving recons to ready", getLoggerMeta(req), error);
			return sendError(res, "INTERNAL_ERROR", undefined, {
				error: error.message,
			});
		}
	};

	updateRecons = async (req: Request, res: Response) => {
		try {
			reconLogger.info("Updating recons", getLoggerMeta(req));
			const userId = req.params.userId;
			
			if (!validateUserId(userId)) {
				reconLogger.error("Valid User ID is required", getLoggerMeta(req));

				return sendError(res, "INVALID_QUERY_PARAMS", undefined, {
					message: "Valid User ID is required",
				});
			}

			let reconData: {
				recons: any[];
			};

			// Check if CSV data was uploaded
			if ((req as any).processedCsvData) {
				reconLogger.info(
					"Processing CSV data for recon update",
					getLoggerMeta(req),
				);
				reconData = this.convertCsvToReconData(
					(req as any).processedCsvData.data,
				);
			} else {
				// Handle JSON body request
				const validationResult = UpdateReconSchema.safeParse(req.body);
				if (!validationResult.success) {
					reconLogger.error(
						"Invalid body",
						getLoggerMeta(req),
						validationResult.error,
					);

					return sendError(res, "INVALID_REQUEST_BODY", undefined, {
						message: "Invalid body",
						errors: z.treeifyError(validationResult.error),
					});
				}
				reconData = validationResult.data;
			}

			const convertedData = reconData.recons.map((recon: any) => ({
				orderId: recon.order_id,
				reconData: this.getUpdateData(recon),
			}));

			logger.info("Updating recons", {
				userId,
				recons: convertedData,
			});

			const updated = await this.reconService.updateMultipleRecons(
				userId,
				convertedData,
			);

			reconLogger.info("Recons updated successfully", {
				...getLoggerMeta(req),
				dataSource: (req as any).processedCsvData ? "CSV" : "JSON",
			});

			return sendSuccess(res, updated, "Recons updated successfully");
		} catch (error: any) {
			reconLogger.error(
				"Error updating recons",
				getLoggerMeta(req),
				error,
			);
			if (error.message && error.message.includes("INVALID::")) {
				return sendError(res, "INVALID_REQUEST_BODY", undefined, {
					message: "Invalid CSV data",
					errors: [error.message],
				});
			}

			return sendError(res, "INTERNAL_ERROR", undefined, {
				error: error.message,
			});
		}
	};

	private getUpdateData(data: any) {
		const reconPartialData: any = {};
		
		if (data.recon_status !== undefined) {
			reconPartialData.recon_status = data.recon_status;
		}
		
		if (data.recon_breakdown !== undefined) {
			reconPartialData.recon_breakdown = data.recon_breakdown;
		}
		
		if (data.on_recon_breakdown !== undefined) {
			reconPartialData.on_recon_breakdown = data.on_recon_breakdown;
		}
		
		if (data.inter_np_settlement !== undefined) {
			reconPartialData.inter_np_settlement = data.inter_np_settlement;
		}
		
		if (data.due_date !== undefined) {
			reconPartialData.due_date = new Date(data.due_date);
		}
		
		return reconPartialData;
	}

	private convertCsvToReconData(csvData: any[]): {
		recons: any[];
	} {
		reconLogger.info("Converting CSV data to recon format", {
			rowCount: csvData.length,
		});

		const recons = csvData.map((row, index) => {
			// Validate required fields
			if (!row["Order ID"]) {
				throw new Error(`INVALID::Row ${index + 1}: Order ID is required`);
			}

			const recon: any = {
				order_id: row["Order ID"].toString().trim(),
			};

			// Handle Status field
			if (row["Status"] !== undefined && row["Status"] !== "") {
				const status = row["Status"].toString().trim().toUpperCase();
				// Map status values to enum values
				const statusMapping: { [key: string]: string } = {
					"ACCEPTED": "RECEIVED_ACCEPTED",
					"REJECTED": "RECEIVED_REJECTED", 
					"PENDING": "RECEIVED_PENDING"
				};
				recon.recon_status = statusMapping[status] || status;
			}

			// Handle on_recon_breakdown fields (this appears to be for on_recon data)
			const onReconBreakdown: any = {};
			let hasOnReconBreakdown = false;

			if (row["Total Order Value"] !== undefined && row["Total Order Value"] !== "") {
				onReconBreakdown.amount = parseFloat(row["Total Order Value"]);
				if (isNaN(onReconBreakdown.amount)) {
					throw new Error(`INVALID::Row ${index + 1}: invalid Total Order Value`);
				}
				hasOnReconBreakdown = true;
			}

			if (row["BFF (Commission)"] !== undefined && row["BFF (Commission)"] !== "") {
				onReconBreakdown.commission = parseFloat(row["BFF (Commission)"]);
				if (isNaN(onReconBreakdown.commission)) {
					throw new Error(`INVALID::Row ${index + 1}: invalid BFF (Commission)`);
				}
				hasOnReconBreakdown = true;
			}

			if (row["Withholding"] !== undefined && row["Withholding"] !== "") {
				onReconBreakdown.withholding_amount = parseFloat(row["Withholding"]);
				if (isNaN(onReconBreakdown.withholding_amount)) {
					throw new Error(`INVALID::Row ${index + 1}: invalid Withholding`);
				}
				hasOnReconBreakdown = true;
			}

			if (row["TCS"] !== undefined && row["TCS"] !== "") {
				onReconBreakdown.tcs = parseFloat(row["TCS"]);
				if (isNaN(onReconBreakdown.tcs)) {
					throw new Error(`INVALID::Row ${index + 1}: invalid TCS`);
				}
				hasOnReconBreakdown = true;
			}

			if (row["TDS"] !== undefined && row["TDS"] !== "") {
				onReconBreakdown.tds = parseFloat(row["TDS"]);
				if (isNaN(onReconBreakdown.tds)) {
					throw new Error(`INVALID::Row ${index + 1}: invalid TDS`);
				}
				hasOnReconBreakdown = true;
			}

			// Handle Inter NP Settlement as a separate field
			if (row["Inter NP Settlement"] !== undefined && row["Inter NP Settlement"] !== "") {
				const interNPSettlement = parseFloat(row["Inter NP Settlement"]);
				if (isNaN(interNPSettlement)) {
					throw new Error(`INVALID::Row ${index + 1}: invalid Inter NP Settlement`);
				}
				recon.inter_np_settlement = interNPSettlement;
			}

			if (hasOnReconBreakdown) {
				// Only include fields that are present
				const finalOnReconBreakdown: any = {};
				if (onReconBreakdown.amount !== undefined) finalOnReconBreakdown.amount = onReconBreakdown.amount;
				if (onReconBreakdown.commission !== undefined) finalOnReconBreakdown.commission = onReconBreakdown.commission;
				if (onReconBreakdown.withholding_amount !== undefined) finalOnReconBreakdown.withholding_amount = onReconBreakdown.withholding_amount;
				if (onReconBreakdown.tcs !== undefined) finalOnReconBreakdown.tcs = onReconBreakdown.tcs;
				if (onReconBreakdown.tds !== undefined) finalOnReconBreakdown.tds = onReconBreakdown.tds;
				recon.on_recon_breakdown = finalOnReconBreakdown;
			}

			return recon;
		});

		logger.debug("Converted CSV data to recon format", {
			recons: recons,
		});
		return { recons };
	}
}
