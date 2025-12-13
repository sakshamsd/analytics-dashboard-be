import express from "express";
import companyRoutes from "./routes/company.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";
import contactRoutes from "./routes/contact.routes.js";
import dealRoutes from "./routes/deal.routes.js";
import activityRoutes from "./routes/activity.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/contacts", contactRoutes);
app.use("/api/v1/deals", dealRoutes);
app.use("/api/v1/activities", activityRoutes);

app.use(errorHandler);

export default app;
