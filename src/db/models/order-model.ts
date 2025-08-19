import mongoose from "mongoose";
import { ENUMS } from "../../constants/enums";

export const round2 = (value: any) => {
	if (typeof value !== "number") {
		return value;
	}
	return Math.round(value * 100) / 100;
};
const Quote = new mongoose.Schema({
	total_order_value: { type: Number, required: true, set: round2 },
	breakup: [
		{
			title: { type: String, required: true },
			price: { type: Number, required: true, set: round2 },
			id: { type: String, required: true },
		},
	],
});

const OrderSchema = new mongoose.Schema(
	{
		order_id: { type: String, required: true },
		user_id: { type: String, required: true },
		bap_uri: { type: String, required: true },
		bpp_uri: { type: String, required: true },
		bap_id: { type: String, required: true },
		bpp_id: { type: String, required: true },
		domain: { type: String, required: true },
		provider_id: { type: String, required: true },
		state: {
			type: String,
			enum: Object.values(ENUMS.ORDER_STATE),
			required: true,
		},
		created_at: { type: Date, required: true },
		updated_at: { type: Date, required: true },
		collected_by: {
			type: String,
			enum: ["BAP", "BPP"],
			required: true,
		},
		msn: { type: Boolean, default: false, required: true },
		settlement_counterparty: { type: String, required: false },
		buyer_finder_fee_amount: { type: Number, required: true, set: round2 },
		buyer_finder_fee_type: { type: String, required: true },
		settlement_basis: { type: String, required: false, default: null },
		settlement_window: { type: String, required: false, default: null },
		withholding_amount: { type: Number, required: false, set: round2 },
		item_tax: { type: Number, required: false, default: 0, set: round2 },
		settle_status: {
			type: String,
			enum: Object.values(ENUMS.INTERNAL_ORDER_SETTLE_STATUS),
			default: ENUMS.INTERNAL_ORDER_SETTLE_STATUS.READY,
		},
		due_date: { type: Date, required: false, default: null },
		quote: { type: Quote, required: true },
		payment_transaction_id: { type: String, required: false },
	},
	{ timestamps: true },
);

OrderSchema.index({ order_id: 1, user_id: 1 }, { unique: true });

export const Order = mongoose.model("Order", OrderSchema);
