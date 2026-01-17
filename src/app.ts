import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import companyRoutes from "./routes/company.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";
import contactRoutes from "./routes/contact.routes.js";
import dealRoutes from "./routes/deal.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import { contextMiddleware } from "./middlewares/context.js";
import userRoutes from "./routes/user.routes.js";
import bootstrapRoutes from "./routes/botstrap.routes.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
	origin: process.env.CORS_ORIGIN || "*",
	credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});
app.use(contextMiddleware);

app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/contacts", contactRoutes);
app.use("/api/v1/deals", dealRoutes);
app.use("/api/v1/activities", activityRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/bootstrap", bootstrapRoutes);

app.use(errorHandler);

export default app;
