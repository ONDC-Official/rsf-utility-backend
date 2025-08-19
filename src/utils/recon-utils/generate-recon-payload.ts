import { UserType } from "../../schema/models/user-schema";
import { ReconAggregateData } from "../../types/generate-recon-types";
import { v4 as uuidv4 } from "uuid";
import logger from "../logger";
import { ReconPayload } from "../../schema/rsf/zod/recon-schema";
export function reconBuilder(
	userConfig: UserType,
	reconData: ReconAggregateData,
): ReconPayload {
	logger.debug(
		`Recon Builder called with data: ${JSON.stringify(reconData)}`,
		reconData,
	);
	return {
		context: {
			domain: "ONDC:NTS10",
			location: {
				country: {
					code: "IND",
				},
				city: {
					code: "*",
				},
			},
			version: "2.0.0",
			action: "recon",
			bap_id: reconData[0].orderData.bap_id,
			bpp_id: reconData[0].orderData.bpp_id,
			bap_uri: reconData[0].orderData.bap_uri,
			bpp_uri: reconData[0].orderData.bpp_uri,
			transaction_id: uuidv4(),
			message_id: uuidv4(),
			timestamp: new Date().toISOString(),
			ttl: "P1D",
		},
		message: {
			orders: reconData.map((data) => {
				const settleData = data.settleData;
				const apiData = data.reconData;
				const settlementAmount =
					apiData.recon_data?.settlement_amount ??
					settleData.inter_np_settlement;
				const commission =
					apiData.recon_data?.commission_amount ?? settleData.commission;
				const withholdingAmount =
					apiData.recon_data?.withholding_amount ??
					settleData.withholding_amount;
				const tcsValue: number = apiData.recon_data?.tcs ?? userConfig.np_tcs;
				const tdsValue: number = apiData.recon_data?.tds ?? userConfig.np_tds;
				const tcs = (settlementAmount * tcsValue) / 100;
				const tds = (settlementAmount * tdsValue) / 100;
				return {
					id: settleData.order_id,
					amount: {
						currency: "INR",
						value: settleData.total_order_value.toFixed(2),
					},
					settlements: [
						{
							id: uuidv4(),
							payment_id: "pymnt-1",
							status: "PENDING",
							amount: {
								currency: "INR",
								value: Math.abs(settlementAmount).toFixed(2),
							},
							commission: {
								currency: "INR",
								value: Math.abs(commission).toFixed(2),
							},
							withholding_amount: {
								currency: "INR",
								value: Math.abs(withholdingAmount).toFixed(2),
							},
							tcs: {
								currency: "INR",
								value: Math.abs(tcs).toFixed(2),
							},
							tds: {
								currency: "INR",
								value: Math.abs(tds).toFixed(2),
							},
							updated_at: new Date().toISOString(),
						},
					],
				};
			}),
		},
	};
}
