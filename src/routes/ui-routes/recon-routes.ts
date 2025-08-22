import { Router } from "express";
import { container } from "../../di/container";
import { optionalCsvUploadMiddleware } from "../../middlewares/csv-upload";

const reconRouter = Router();
const reconController = container.reconController;

reconRouter.get("/:userId", reconController.getRecons);
reconRouter.post("/:userId/move-to-ready", reconController.moveReconsToReady);

// Update recon - supports both JSON body and CSV file upload
reconRouter.patch(
	"/:userId",
	optionalCsvUploadMiddleware, 
	reconController.updateRecons,
);


export default reconRouter;
