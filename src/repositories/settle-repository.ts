import { z } from "zod";
import { Settle } from "../db/models/settle-model";
import { SettleSchema, SettleType } from "../schema/models/settle-schema";
import logger from "../utils/logger";

export class SettleRepository {
	async findWithQuery(queryData: {
		user_id: string;
		skip: number;
		limit: number;
		counterparty_id?: string;
		order_id?: string;
		status?: string[];
		due_date_from?: Date;
		due_date_to?: Date;
	}) {
		const {
			limit,
			skip,
			counterparty_id,
			user_id,
			order_id,
			status,
			due_date_from,
			due_date_to,
		} = queryData;
		const query: any = { user_id };
		if (order_id) query.order_id = order_id;
		if (status) query.status = status;
		if (counterparty_id) {
			query.$or = [
				{ receiver_id: counterparty_id },
				{ collector_id: counterparty_id },
			];
		}
		// Date range filter
		if (due_date_from || due_date_to) {
			query.due_date = {};
			if (due_date_from) query.due_date.$gte = due_date_from;
			if (due_date_to) query.due_date.$lte = due_date_to;
		}
		const count = await Settle.countDocuments(query);
		const data = await Settle.find(query)
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });
		return {
			count: count,
			data: data,
		};
	}

	async findSingleSettlement(userId: string, orderId: string) {
		return await Settle.findOne({ user_id: userId, order_id: orderId });
	}

	async insertSettlementList(settlements: z.infer<typeof SettleSchema>[]) {
		return await Settle.insertMany(settlements);
	}

	async updateSettlement(
		userId: string,
		orderId: string,
		settlement: Partial<SettleType>,
	) {
		logger.debug("Updating settlement for user", {
			userId,
			orderId,
			settlement,
		});
		return await Settle.findOneAndUpdate(
			{ user_id: userId, order_id: orderId },
			{ $set: settlement },
			{ new: true },
		);
	}

	async checkUniqueSettlement(userId: string, orderId: string) {
		return await Settle.exists({
			user_id: userId,
			order_id: orderId,
		});
	}
	async getSettlementByOnSettle(
		txn_id: string,
		message_id: string,
		order_id: string,
	) {
		const settlement = await Settle.findOne({
			"context.transaction_id": txn_id,
			"context.message_id": message_id,
			order_id: order_id,
		});
		return settlement;
	}
	async updateSettlementByTransaction(
		txn_id: string,
		orderId: string,
		settlement: Partial<z.infer<typeof SettleSchema>>,
	) {
		return await Settle.findOneAndUpdate(
			{
				transaction_db_ids: txn_id,
				order_id: orderId,
			},
			{ $set: settlement },
			{ new: true },
		);
	}

	getByTransactionDbId(orderId: string, dbId: string) {
		return Settle.findOne({ transaction_db_ids: dbId, order_id: orderId });
	}
	async deleteSettlement(userId: string, orderId: string) {
		return await Settle.deleteOne({ user_id: userId, order_id: orderId });
	}
}
