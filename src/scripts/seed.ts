import "reflect-metadata";
import { AppDataSource } from "../database/data-source.js";
import { connectMongo } from "../database/mongo.js";
import mongoose from "mongoose";
import { Workspace } from "../entities/Workspace.js";
import { User, UserStatus } from "../entities/User.js";
import { WorkspaceMember, WorkspaceRole } from "../entities/WorkspaceMember.js";
import { Company, Industry, LeadSource, CompanyStatus, CompanySize } from "../entities/Companies.js";
import { Contact, ContactStatus } from "../entities/Contact.js";
import { Deals, DealStatus, DealStage, DealPriority, DealLostReason } from "../entities/Deals.js";
import { Activities, ActivityType, ActivityStatus, ActivityPriority } from "../entities/Activities.js";
import { DashboardConfig } from "../mongo/models/dashboardConfig.model.js";
import { DEFAULT_WIDGETS } from "../constants/defaultWidgets.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomDate(start: Date, end: Date): Date {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function monthsAgo(n: number): Date {
	const d = new Date();
	d.setMonth(d.getMonth() - n);
	return d;
}

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function futureDateStr(daysAhead: number): string {
	const d = new Date();
	d.setDate(d.getDate() + daysAhead);
	return d.toISOString().split("T")[0]!;
}

function shuffle<T>(arr: T[]): T[] {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const tmp = arr[i]!;
		arr[i] = arr[j]!;
		arr[j] = tmp;
	}
	return arr;
}

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
	await AppDataSource.initialize();
	await connectMongo();

	const workspaceRepo = AppDataSource.getRepository(Workspace);
	const userRepo      = AppDataSource.getRepository(User);
	const memberRepo    = AppDataSource.getRepository(WorkspaceMember);
	const companyRepo   = AppDataSource.getRepository(Company);
	const contactRepo   = AppDataSource.getRepository(Contact);
	const dealRepo      = AppDataSource.getRepository(Deals);
	const activityRepo  = AppDataSource.getRepository(Activities);

	// Idempotency guard
	const existing = await workspaceRepo.findOne({ where: { name: "Acme Corp CRM" } });
	if (existing) {
		console.log("Workspace 'Acme Corp CRM' already exists — skipping seed.");
		await AppDataSource.destroy();
		await mongoose.disconnect();
		return;
	}

	// ── 1. Workspace ─────────────────────────────────────────────────────────

	const workspace = workspaceRepo.create({ name: "Acme Corp CRM" });
	await workspaceRepo.save(workspace);
	const workspaceId = workspace.id;
	console.log(`✓ Workspace created: ${workspaceId}`);

	// ── 2. Users (1 OWNER, 1 ADMIN, 3 MEMBER) ────────────────────────────────

	const userDefs = [
		{ fullName: "Alice Johnson",  email: "alice@acmecorp.com",  role: WorkspaceRole.OWNER  },
		{ fullName: "Bob Martinez",   email: "bob@acmecorp.com",    role: WorkspaceRole.ADMIN  },
		{ fullName: "Carol Chen",     email: "carol@acmecorp.com",  role: WorkspaceRole.MEMBER },
		{ fullName: "David Kim",      email: "david@acmecorp.com",  role: WorkspaceRole.MEMBER },
		{ fullName: "Eva Patel",      email: "eva@acmecorp.com",    role: WorkspaceRole.MEMBER },
	];

	const users: User[] = [];
	for (const def of userDefs) {
		const u = userRepo.create({ fullName: def.fullName, email: def.email, status: UserStatus.ACTIVE });
		await userRepo.save(u);
		const m = memberRepo.create({ workspaceId, userId: u.id, role: def.role });
		await memberRepo.save(m);
		users.push(u);
	}
	console.log(`✓ Users: ${users.length}`);

	// ── 3. Companies (35 total, technology/finance weighted) ──────────────────

	// Industry distribution: 8 tech, 7 finance, 5 healthcare, 5 retail, 4 mfg, 3 edu, 3 real-estate
	const industryPool: Industry[] = shuffle([
		...Array(8).fill(Industry.TECHNOLOGY),
		...Array(7).fill(Industry.FINANCE),
		...Array(5).fill(Industry.HEALTHCARE),
		...Array(5).fill(Industry.RETAIL),
		...Array(4).fill(Industry.MANUFACTURING),
		...Array(3).fill(Industry.EDUCATION),
		...Array(3).fill(Industry.REAL_ESTATE),
	]);

	const states  = ["California", "New York", "Texas", "Illinois", "Washington"];
	const cities  = ["San Francisco", "New York", "Austin", "Chicago", "Seattle"];
	const leadSrcs = Object.values(LeadSource);
	const coSizes  = Object.values(CompanySize);
	const coStatuses = [CompanyStatus.ACTIVE, CompanyStatus.ACTIVE, CompanyStatus.PROSPECT, CompanyStatus.INACTIVE];

	// Date distribution: 5 | 8 | 8 | 8 | 6  (oldest → newest)
	const companyBuckets = [
		{ start: monthsAgo(12), end: monthsAgo(11), count: 5  },
		{ start: monthsAgo(11), end: monthsAgo(8),  count: 8  },
		{ start: monthsAgo(8),  end: monthsAgo(5),  count: 8  },
		{ start: monthsAgo(5),  end: monthsAgo(2),  count: 8  },
		{ start: monthsAgo(2),  end: new Date(),     count: 6  },
	];

	const companies: Company[] = [];
	for (const bucket of companyBuckets) {
		for (let i = 0; i < bucket.count; i++) {
			const n   = companies.length + 1;
			const ind = industryPool[companies.length]!;
			const co  = companyRepo.create({
				name:        `${ind.charAt(0).toUpperCase() + ind.slice(1)} Solutions ${n}`,
				email:       `info@company${n}.com`,
				phone:       `+1555${String(n).padStart(7, "0")}`,
				website:     `https://company${n}.com`,
				industry:    ind,
				country:     "United States",
				state:       pick(states),
				city:        pick(cities),
				address:     `${randomInt(100, 9999)} Business Ave`,
				postalCode:  String(randomInt(10000, 99999)),
				leadSource:  pick(leadSrcs),
				status:      pick(coStatuses),
				companySize: pick(coSizes),
				workspaceId,
				ownerId:     pick(users).id,
				createdBy:   pick(users).id,
			});
			co.createdAt = randomDate(bucket.start, bucket.end);
			await companyRepo.save(co);
			companies.push(co);
		}
	}
	console.log(`✓ Companies: ${companies.length}`);

	// ── 4. Contacts (100 total, increasing creation rate) ─────────────────────

	const firstNames = [
		"James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
		"William", "Barbara", "David", "Susan", "Richard", "Jessica", "Joseph", "Sarah",
		"Thomas", "Karen", "Charles", "Lisa", "Mark", "Nancy", "Daniel", "Betty",
	];
	const lastNames = [
		"Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson",
		"Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
		"Garcia", "Thompson", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee",
	];
	const jobTitles = [
		"CEO", "CTO", "VP Sales", "Product Manager", "Sales Manager",
		"Marketing Director", "CFO", "Operations Manager", "Business Development", "Account Executive",
	];

	// Date distribution: 10 | 20 | 20 | 25 | 15 | 10
	const contactBuckets = [
		{ start: monthsAgo(12), end: monthsAgo(11), count: 10 },
		{ start: monthsAgo(11), end: monthsAgo(8),  count: 20 },
		{ start: monthsAgo(8),  end: monthsAgo(5),  count: 20 },
		{ start: monthsAgo(5),  end: monthsAgo(2),  count: 25 },
		{ start: monthsAgo(2),  end: monthsAgo(1),  count: 15 },
		{ start: monthsAgo(1),  end: new Date(),     count: 10 },
	];

	const contacts: Contact[] = [];
	for (const bucket of contactBuckets) {
		for (let i = 0; i < bucket.count; i++) {
			const n         = contacts.length + 1;
			const firstName = pick(firstNames);
			const lastName  = pick(lastNames);
			const company   = pick(companies);
			const ct        = contactRepo.create({
				name:       `${firstName} ${lastName}`,
				email:      `${firstName.toLowerCase()}.${lastName.toLowerCase()}${n}@example.com`,
				phone:      `+1555${String(randomInt(1000000, 9999999))}`,
				jobTitle:   pick(jobTitles),
				status:     ContactStatus.ACTIVE,
				leadSource: pick(leadSrcs),
				companyId:  company.id,
				assignedTo: pick(users).id,
				workspaceId,
				ownerId:    pick(users).id,
				createdBy:  pick(users).id,
			});
			ct.createdAt = randomDate(bucket.start, bucket.end);
			await contactRepo.save(ct);
			contacts.push(ct);
		}
	}
	console.log(`✓ Contacts: ${contacts.length}`);

	// ── 5. Deals (60 total: 30% WON, 20% LOST, 50% OPEN) ────────────────────

	// Status/stage pool (shuffled)
	const dealStatusPool: { status: DealStatus; stage: DealStage; lostReason?: DealLostReason }[] = shuffle([
		// 18 WON
		...Array(18).fill(null).map(() => ({ status: DealStatus.WON, stage: DealStage.CLOSED_WON })),
		// 12 LOST
		...Array(12).fill(null).map(() => ({
			status: DealStatus.LOST,
			stage: DealStage.CLOSED_LOST,
			lostReason: pick(Object.values(DealLostReason)),
		})),
		// 30 OPEN: prospecting 9, qualification 8, proposal 8, negotiation 5
		...Array(9).fill({ status: DealStatus.OPEN, stage: DealStage.PROSPECTING }),
		...Array(8).fill({ status: DealStatus.OPEN, stage: DealStage.QUALIFICATION }),
		...Array(8).fill({ status: DealStatus.OPEN, stage: DealStage.PROPOSAL }),
		...Array(5).fill({ status: DealStatus.OPEN, stage: DealStage.NEGOTIATION }),
	]);

	// Value pool in cents: 24 small ($5k-$20k), 21 medium ($20k-$75k), 15 large ($75k-$200k)
	const dealValuePool: number[] = shuffle([
		...Array(24).fill(null).map(() => randomInt(500_000,  2_000_000)),
		...Array(21).fill(null).map(() => randomInt(2_000_000, 7_500_000)),
		...Array(15).fill(null).map(() => randomInt(7_500_000, 20_000_000)),
	]);

	function stageProbability(stage: DealStage): number {
		switch (stage) {
			case DealStage.PROSPECTING:   return randomInt(10, 30);
			case DealStage.QUALIFICATION: return randomInt(25, 50);
			case DealStage.PROPOSAL:      return randomInt(40, 70);
			case DealStage.NEGOTIATION:   return randomInt(60, 85);
			case DealStage.CLOSED_WON:    return 100;
			case DealStage.CLOSED_LOST:   return 0;
		}
	}

	// Date distribution: 5 | 10 | 15 | 15 | 10 | 5
	const dealBuckets = [
		{ start: monthsAgo(12), end: monthsAgo(11), count: 5  },
		{ start: monthsAgo(11), end: monthsAgo(8),  count: 10 },
		{ start: monthsAgo(8),  end: monthsAgo(5),  count: 15 },
		{ start: monthsAgo(5),  end: monthsAgo(2),  count: 15 },
		{ start: monthsAgo(2),  end: monthsAgo(1),  count: 10 },
		{ start: monthsAgo(1),  end: new Date(),     count: 5  },
	];

	const deals: Deals[] = [];
	for (const bucket of dealBuckets) {
		for (let i = 0; i < bucket.count; i++) {
			const idx              = deals.length;
			const { status, stage, lostReason } = dealStatusPool[idx]!;
			const company          = pick(companies);
			const companyContacts  = contacts.filter(c => c.companyId === company.id);
			const contact          = companyContacts.length > 0 ? pick(companyContacts) : pick(contacts);
			const dealCreatedAt    = randomDate(bucket.start, bucket.end);

			const d = dealRepo.create({
				title:            `Deal with ${company.name} #${idx + 1}`,
				dealValue:        dealValuePool[idx]!,
				currency:         "AUD",
				status,
				stage,
				priority:         pick(Object.values(DealPriority)),
				probability:      stageProbability(stage),
				expectedCloseDate: futureDateStr(randomInt(30, 180)),
				actualCloseDate:  (status === DealStatus.WON || status === DealStatus.LOST)
					? randomDate(bucket.start, bucket.end).toISOString().split("T")[0]!
					: null,
				lostReason:       lostReason ?? null,
				companyId:        company.id,
				contactId:        contact.id,
				assignedTo:       pick(users).id,
				workspaceId,
				ownerId:          pick(users).id,
				createdBy:        pick(users).id,
			});
			d.createdAt = dealCreatedAt;
			await dealRepo.save(d);
			deals.push(d);
		}
	}
	console.log(`✓ Deals: ${deals.length}`);

	// ── 6. Activities (250 total) ─────────────────────────────────────────────
	// calls 30%=75, emails 25%=62, meetings 20%=50, tasks 15%=38, notes 10%=25 → 250

	const actTypePool: ActivityType[] = shuffle([
		...Array(75).fill(ActivityType.CALL),
		...Array(62).fill(ActivityType.EMAIL),
		...Array(50).fill(ActivityType.MEETING),
		...Array(38).fill(ActivityType.TASK),
		...Array(25).fill(ActivityType.NOTE),
	]);

	// 60% DONE (150), 40% OPEN (100)
	const actStatusPool: ActivityStatus[] = shuffle([
		...Array(150).fill(ActivityStatus.DONE),
		...Array(100).fill(ActivityStatus.OPEN),
	]);

	// Date distribution: 40 | 60 | 70 | 50 | 30
	const activityBuckets = [
		{ start: monthsAgo(11), end: monthsAgo(8),  count: 40 },
		{ start: monthsAgo(8),  end: monthsAgo(5),  count: 60 },
		{ start: monthsAgo(5),  end: monthsAgo(2),  count: 70 },
		{ start: monthsAgo(2),  end: monthsAgo(1),  count: 50 },
		{ start: monthsAgo(1),  end: new Date(),     count: 30 },
	];

	let actIdx = 0;
	for (const bucket of activityBuckets) {
		for (let i = 0; i < bucket.count; i++) {
			const contact  = pick(contacts);
			const deal     = Math.random() > 0.5 ? pick(deals) : null;
			const actDate  = randomDate(bucket.start, bucket.end);
			const type     = actTypePool[actIdx]!;
			const status   = actStatusPool[actIdx]!;

			const a = activityRepo.create({
				type,
				subject:    `${type.charAt(0).toUpperCase() + type.slice(1)} with ${contact.name}`,
				body:       null,
				priority:   pick(Object.values(ActivityPriority)),
				status,
				dueDate:    actDate.toISOString().split("T")[0]!,
				dueTime:    `${String(randomInt(8, 17)).padStart(2, "0")}:00:00`,
				contactId:  contact.id,
				dealId:     deal?.id ?? null,
				companyId:  contact.companyId,
				assignedTo: pick(users).id,
				workspaceId,
				ownerId:    pick(users).id,
				createdBy:  pick(users).id,
			});
			a.createdAt = actDate;
			await activityRepo.save(a);
			actIdx++;
		}
	}
	console.log(`✓ Activities: ${actIdx}`);

	// ── 7. MongoDB DashboardConfig (1 per user) ───────────────────────────────

	for (const user of users) {
		await DashboardConfig.create({
			userId:      user.id,
			workspaceId,
			widgets:     DEFAULT_WIDGETS,
		});
	}
	console.log(`✓ DashboardConfigs: ${users.length}`);

	// ── Done ──────────────────────────────────────────────────────────────────

	await AppDataSource.destroy();
	await mongoose.disconnect();
	console.log("\nSeed complete.");
	console.log(`  Workspace ID : ${workspaceId}`);
	console.log(`  User IDs     : ${users.map(u => u.id).join(", ")}`);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
