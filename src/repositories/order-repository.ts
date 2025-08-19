import { query } from "winston";
import { Order } from "../db/models/order-model";
import { OrderType } from "../schema/models/order-schema";
import { GetOrderParamsType } from "../types/order-params";

export class OrderRepository {
	async createOrder(data: OrderType) {
		return await Order.create(data);
	}
	async getAllOrders(queryParams: GetOrderParamsType, user_id: string) {
		const { page, limit, state, settle_status, due_date_from, due_date_to } =
			queryParams;
		const query: any = {};
		if (user_id) {
			query.user_id = user_id;
		}
		if (state && state.length > 0) {
			query.state = { $in: state };
		}
		if (settle_status && settle_status.length > 0) {
			query.settle_status = { $in: settle_status };
		}
		if (queryParams.counterparty_id) {
			query.$or = [
				{ bap_id: queryParams.counterparty_id },
				{ bpp_id: queryParams.counterparty_id },
			];
		}

		if (due_date_from || due_date_to) {
			query.due_date = {};
			if (due_date_from) query.due_date.$gte = due_date_from;
			if (due_date_to) query.due_date.$lte = due_date_to;
		}

		const totalCount = await Order.countDocuments(query);
		const data = await Order.find(query)
			.skip((page - 1) * limit)
			.limit(limit)
			.sort({ createdAt: -1 });

		return { totalCount, data };
	}
	async findOrderByUserAndOrderId(user_id: string, order_id: string) {
		return await Order.findOne({ user_id, order_id });
	}
	async updateOrderByUserAndOrderId(
		user_id: string,
		order_id: string,
		updateData: any,
	) {
		return await Order.findOneAndUpdate({ user_id, order_id }, updateData, {
			new: true,
		});
	}

	async checkOrderByUserAndOrderId(user_id: string, order_id: string) {
		return await Order.exists({ user_id, order_id });
	}
}
