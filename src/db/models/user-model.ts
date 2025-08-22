import mongoose from "mongoose";
import { APPLICABILITY_VALUES } from "../../constants/enums";
import { round2 } from "./order-model";

const ProviderDetails = new mongoose.Schema(
	{
		provider_name: { type: String, required: true },
		provider_id: { type: String, required: true },
		account_number: { type: String, required: true },
		ifsc_code: { type: String, required: true },
		bank_name: { type: String, required: true },
	},
	{ _id: false },
);

const CounterpartyInfo = new mongoose.Schema(
	{
		id: { type: String, required: true },
		nickName: { type: String, required: true },
	},
	{ _id: false },
);

const UserSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		role: {
			type: String,
			enum: ["BAP", "BPP"],
			required: true,
		},
		subscriber_url: { type: String, required: true },
		domain: { type: String, required: true },
		np_tcs: { type: Number, required: false, set: round2 },
		np_tds: { type: Number, required: false, set: round2 },
		pr_tcs: { type: Number, required: false, set: round2 },
		pr_tds: { type: Number, required: false, set: round2 },
		np_tcs_effective: { type: Number, required: true, set: round2 },
		np_tds_effective: { type: Number, required: true, set: round2 },
		pr_tcs_effective: { type: Number, required: false, set: round2 },
		pr_tds_effective: { type: Number, required: false, set: round2 },
		np_tcs_with_effective_date: { type: Date, required: true, default: null },
		np_tds_with_effective_date: { type: Date, required: true, default: null },
		pr_tcs_with_effective_date: { type: Date, required: false, default: null },
		pr_tds_with_effective_date: { type: Date, required: false, default: null },
		tcs_applicability: {
			type: String,
			enum: Object.values(APPLICABILITY_VALUES),
			required: true,
		},
		tds_applicability: {
			type: String,
			enum: Object.values(APPLICABILITY_VALUES),
			required: true,
		},
		msn: { type: Boolean, required: true },
		provider_details: { type: [ProviderDetails], required: true },
		counterparty_infos: {
			type: [CounterpartyInfo],
			required: true,
		},
		counterparty_ids: {
			type: [String],
			required: false,
		},
	},
	{ timestamps: true },
);

// Compound index for uniqueness on role + subscriber_id + domain
UserSchema.index({ role: 1, subscriber_url: 1, domain: 1 }, { unique: true });
UserSchema.index({ title: 1 }, { unique: true });
export const User = mongoose.model("User", UserSchema);
