import "reflect-metadata";
import { AppDataSource } from "../database/data-source.js";
import { connectMongo } from "../database/mongo.js";
import mongoose from "mongoose";
import { Workspace } from "../entities/Workspace.js";
import { User, UserStatus } from "../entities/User.js";
import { WorkspaceMember, WorkspaceRole } from "../entities/WorkspaceMember.js";
import { Company, Industry, LeadSource, CompanyStatus, CompanySize } from "../entities/Companies.js";
import { Contact, ContactStatus, PreferredContactMethod } from "../entities/Contact.js";
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

function pastDateStr(daysAgo: number): string {
	const d = new Date();
	d.setDate(d.getDate() - daysAgo);
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

/** Build a pool of N items with weights. weights must sum to N. */
function weightedPool<T>(entries: { value: T; count: number }[]): T[] {
	return shuffle(entries.flatMap(e => Array(e.count).fill(e.value)));
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

	// ── 3. Companies (150 total) ──────────────────────────────────────────────
	// Industry weights: tech 30, finance 25, healthcare 20, retail 20,
	//                   manufacturing 18, education 20, real-estate 17

	const industryPool = weightedPool<Industry>([
		{ value: Industry.TECHNOLOGY,    count: 30 },
		{ value: Industry.FINANCE,       count: 25 },
		{ value: Industry.HEALTHCARE,    count: 20 },
		{ value: Industry.RETAIL,        count: 20 },
		{ value: Industry.MANUFACTURING, count: 18 },
		{ value: Industry.EDUCATION,     count: 20 },
		{ value: Industry.REAL_ESTATE,   count: 17 },
	]);

	const companyNamePrefixes = [
		"Apex", "Nexus", "Pinnacle", "Summit", "Horizon", "Vertex", "Prime",
		"Atlas", "Nova", "Stellar", "Quantum", "Fusion", "Catalyst", "Stratos",
		"Meridian", "Vantage", "Keystone", "Synergy", "Momentum", "Elevate",
		"Forefront", "Pivotal", "CorePath", "BrightEdge", "BlueLine",
	];
	const companyNameSuffixes = [
		"Solutions", "Systems", "Group", "Partners", "Ventures", "Corp",
		"Technologies", "Consulting", "Services", "Holdings", "Industries",
		"Capital", "Dynamics", "Innovations", "Advisors",
	];
	const states = ["California", "New York", "Texas", "Illinois", "Washington",
		"Florida", "Massachusetts", "Georgia", "Colorado", "Arizona"];
	const cities = ["San Francisco", "New York", "Austin", "Chicago", "Seattle",
		"Miami", "Boston", "Atlanta", "Denver", "Phoenix"];
	const countries = ["United States", "United States", "United States", "Canada", "Australia"];
	const leadSrcs  = Object.values(LeadSource);
	const coSizes   = Object.values(CompanySize);
	const coStatuses = weightedPool<CompanyStatus>([
		{ value: CompanyStatus.ACTIVE,   count: 60 },
		{ value: CompanyStatus.PROSPECT, count: 50 },
		{ value: CompanyStatus.INACTIVE, count: 25 },
		{ value: CompanyStatus.CHURNED,  count: 15 },
	]);

	// Increasing density over 12 months
	const companyBuckets = [
		{ start: monthsAgo(12), end: monthsAgo(10), count: 15 },
		{ start: monthsAgo(10), end: monthsAgo(8),  count: 20 },
		{ start: monthsAgo(8),  end: monthsAgo(6),  count: 25 },
		{ start: monthsAgo(6),  end: monthsAgo(4),  count: 30 },
		{ start: monthsAgo(4),  end: monthsAgo(2),  count: 35 },
		{ start: monthsAgo(2),  end: new Date(),     count: 25 },
	];

	const companies: Company[] = [];
	for (const bucket of companyBuckets) {
		for (let i = 0; i < bucket.count; i++) {
			const n   = companies.length + 1;
			const ind = industryPool[companies.length % industryPool.length]!;
			const prefix = pick(companyNamePrefixes);
			const suffix = pick(companyNameSuffixes);
			const co = companyRepo.create({
				name:              `${prefix} ${suffix} ${n}`,
				email:             `info@company${n}.io`,
				phone:             `+1${randomInt(2000000000, 9999999999)}`,
				website:           `https://www.company${n}.io`,
				industry:          ind,
				country:           pick(countries),
				state:             pick(states),
				city:              pick(cities),
				address:           `${randomInt(1, 9999)} ${pick(["Main St", "Business Ave", "Commerce Blvd", "Tech Park Dr", "Innovation Way"])}`,
				postalCode:        String(randomInt(10000, 99999)),
				leadSource:        pick(leadSrcs),
				status:            coStatuses[n % coStatuses.length]!,
				companySize:       pick(coSizes),
				numberOfEmployees: randomInt(5, 5000),
				annualRevenue:     randomInt(100_000, 500_000_000) * 100, // cents
				workspaceId,
				ownerId:           pick(users).id,
				createdBy:         pick(users).id,
			});
			co.createdAt = randomDate(bucket.start, bucket.end);
			await companyRepo.save(co);
			companies.push(co);
		}
	}
	console.log(`✓ Companies: ${companies.length}`);

	// ── 4. Contacts (500 total) ───────────────────────────────────────────────

	const firstNames = [
		"James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
		"William", "Barbara", "David", "Susan", "Richard", "Jessica", "Joseph", "Sarah",
		"Thomas", "Karen", "Charles", "Lisa", "Mark", "Nancy", "Daniel", "Betty",
		"Matthew", "Helen", "Anthony", "Sandra", "Donald", "Dorothy", "Steven", "Ashley",
		"Paul", "Kimberly", "Andrew", "Donna", "Joshua", "Carol", "Kenneth", "Michelle",
		"Kevin", "Emily", "Brian", "Amanda", "George", "Melissa", "Timothy", "Deborah",
		"Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon", "Jeffrey", "Laura",
		"Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Angela", "Nicholas", "Shirley",
	];
	const lastNames = [
		"Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson",
		"Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
		"Garcia", "Thompson", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee",
		"Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez",
		"Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter",
		"Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans",
		"Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook",
		"Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper", "Richardson", "Cox",
	];
	const jobTitles = [
		"CEO", "CTO", "CFO", "COO", "VP Sales", "VP Marketing", "VP Engineering",
		"Product Manager", "Sales Manager", "Marketing Manager", "Account Executive",
		"Business Development Manager", "Operations Manager", "Director of Finance",
		"Senior Software Engineer", "Data Analyst", "UX Designer", "HR Manager",
		"Customer Success Manager", "Procurement Manager", "IT Director", "Legal Counsel",
	];
	const departments = [
		"Sales", "Marketing", "Engineering", "Finance", "Operations",
		"Product", "HR", "Legal", "Customer Success", "IT",
	];

	// Increasing rate: 40|70|90|110|110|80
	const contactBuckets = [
		{ start: monthsAgo(12), end: monthsAgo(10), count: 40  },
		{ start: monthsAgo(10), end: monthsAgo(8),  count: 70  },
		{ start: monthsAgo(8),  end: monthsAgo(6),  count: 90  },
		{ start: monthsAgo(6),  end: monthsAgo(4),  count: 110 },
		{ start: monthsAgo(4),  end: monthsAgo(2),  count: 110 },
		{ start: monthsAgo(2),  end: new Date(),     count: 80  },
	];

	const contactStatuses = weightedPool<ContactStatus>([
		{ value: ContactStatus.ACTIVE,       count: 70 },
		{ value: ContactStatus.INACTIVE,     count: 15 },
		{ value: ContactStatus.BOUNCED,      count: 10 },
		{ value: ContactStatus.UNSUBSCRIBED, count: 5  },
	]);
	const prefMethods = Object.values(PreferredContactMethod);

	const contacts: Contact[] = [];
	for (const bucket of contactBuckets) {
		for (let i = 0; i < bucket.count; i++) {
			const n         = contacts.length + 1;
			const firstName = pick(firstNames);
			const lastName  = pick(lastNames);
			const company   = pick(companies);
			const ct        = contactRepo.create({
				name:                   `${firstName} ${lastName}`,
				email:                  `${firstName.toLowerCase()}.${lastName.toLowerCase()}${n}@example.com`,
				phone:                  `+1${randomInt(2000000000, 9999999999)}`,
				mobile:                 `+1${randomInt(2000000000, 9999999999)}`,
				jobTitle:               pick(jobTitles),
				department:             pick(departments),
				status:                 contactStatuses[n % contactStatuses.length]!,
				leadSource:             pick(leadSrcs),
				preferredContactMethod: pick(prefMethods),
				isPrimary:              Math.random() < 0.15,
				doNotContact:           Math.random() < 0.05,
				companyId:              company.id,
				assignedTo:             pick(users).id,
				workspaceId,
				ownerId:                pick(users).id,
				createdBy:              pick(users).id,
			});
			ct.createdAt = randomDate(bucket.start, bucket.end);
			await contactRepo.save(ct);
			contacts.push(ct);
		}
	}
	console.log(`✓ Contacts: ${contacts.length}`);

	// ── 5. Deals (300 total: 30% WON, 20% LOST, 50% OPEN) ───────────────────

	const TOTAL_DEALS = 300;
	const wonCount    = Math.round(TOTAL_DEALS * 0.30);  // 90
	const lostCount   = Math.round(TOTAL_DEALS * 0.20);  // 60
	const openCount   = TOTAL_DEALS - wonCount - lostCount; // 150

	const dealStatusPool: { status: DealStatus; stage: DealStage; lostReason?: DealLostReason }[] = shuffle([
		...Array(wonCount).fill(null).map(() => ({
			status: DealStatus.WON,
			stage:  DealStage.CLOSED_WON,
		})),
		...Array(lostCount).fill(null).map(() => ({
			status:     DealStatus.LOST,
			stage:      DealStage.CLOSED_LOST,
			lostReason: pick(Object.values(DealLostReason)),
		})),
		// OPEN: prospecting 30%, qualification 25%, proposal 20%, negotiation 15%, (remaining 10% spread)
		...weightedPool([
			{ value: { status: DealStatus.OPEN, stage: DealStage.PROSPECTING   }, count: Math.round(openCount * 0.30) },
			{ value: { status: DealStatus.OPEN, stage: DealStage.QUALIFICATION }, count: Math.round(openCount * 0.25) },
			{ value: { status: DealStatus.OPEN, stage: DealStage.PROPOSAL      }, count: Math.round(openCount * 0.20) },
			{ value: { status: DealStatus.OPEN, stage: DealStage.NEGOTIATION   }, count: Math.round(openCount * 0.15) },
			{ value: { status: DealStatus.OPEN, stage: DealStage.PROSPECTING   }, count: openCount - Math.round(openCount * 0.30) - Math.round(openCount * 0.25) - Math.round(openCount * 0.20) - Math.round(openCount * 0.15) },
		]),
	]);

	// Value distribution: 40% small ($5k–$20k), 35% medium ($20k–$75k), 25% large ($75k–$200k)
	const dealValuePool: number[] = shuffle([
		...Array(Math.round(TOTAL_DEALS * 0.40)).fill(null).map(() => randomInt(500_000,   2_000_000)),
		...Array(Math.round(TOTAL_DEALS * 0.35)).fill(null).map(() => randomInt(2_000_000, 7_500_000)),
		...Array(TOTAL_DEALS - Math.round(TOTAL_DEALS * 0.40) - Math.round(TOTAL_DEALS * 0.35)).fill(null).map(() => randomInt(7_500_000, 20_000_000)),
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

	const dealTitles = [
		"Annual License Agreement", "Enterprise Platform Upgrade", "Professional Services Engagement",
		"Cloud Migration Project", "SaaS Subscription Renewal", "Integration Implementation",
		"Consulting Retainer", "Product Bundle Deal", "Strategic Partnership Agreement",
		"Managed Services Contract", "Custom Development Project", "Training & Onboarding Package",
		"Support & Maintenance Contract", "Data Analytics Suite", "Security Audit & Compliance",
	];

	// Increasing deal volume over 12 months
	const dealBuckets = [
		{ start: monthsAgo(12), end: monthsAgo(10), count: 25 },
		{ start: monthsAgo(10), end: monthsAgo(8),  count: 40 },
		{ start: monthsAgo(8),  end: monthsAgo(6),  count: 55 },
		{ start: monthsAgo(6),  end: monthsAgo(4),  count: 65 },
		{ start: monthsAgo(4),  end: monthsAgo(2),  count: 70 },
		{ start: monthsAgo(2),  end: new Date(),     count: 45 },
	];

	const deals: Deals[] = [];
	for (const bucket of dealBuckets) {
		for (let i = 0; i < bucket.count; i++) {
			const idx     = deals.length;
			const poolEntry = dealStatusPool[idx % dealStatusPool.length]!;
			const { status, stage, lostReason } = poolEntry;
			const company = pick(companies);
			const companyContacts = contacts.filter(c => c.companyId === company.id);
			const contact = companyContacts.length > 0 ? pick(companyContacts) : pick(contacts);
			const dealCreatedAt = randomDate(bucket.start, bucket.end);

			const d = dealRepo.create({
				title:            `${pick(dealTitles)} — ${company.name}`,
				dealValue:        dealValuePool[idx % dealValuePool.length]!,
				currency:         "AUD",
				status,
				stage,
				priority:         pick(Object.values(DealPriority)),
				probability:      stageProbability(stage),
				expectedCloseDate: status === DealStatus.OPEN
					? futureDateStr(randomInt(14, 270))
					: pastDateStr(randomInt(1, 365)),
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

	// ── 6. Activities (1 200 total) ───────────────────────────────────────────
	// calls 30%, emails 25%, meetings 20%, tasks 15%, notes 10%
	// 65% DONE, 35% OPEN

	const TOTAL_ACTIVITIES = 1200;

	const actTypePool: ActivityType[] = weightedPool([
		{ value: ActivityType.CALL,    count: Math.round(TOTAL_ACTIVITIES * 0.30) },
		{ value: ActivityType.EMAIL,   count: Math.round(TOTAL_ACTIVITIES * 0.25) },
		{ value: ActivityType.MEETING, count: Math.round(TOTAL_ACTIVITIES * 0.20) },
		{ value: ActivityType.TASK,    count: Math.round(TOTAL_ACTIVITIES * 0.15) },
		{ value: ActivityType.NOTE,    count: TOTAL_ACTIVITIES - Math.round(TOTAL_ACTIVITIES * 0.30) - Math.round(TOTAL_ACTIVITIES * 0.25) - Math.round(TOTAL_ACTIVITIES * 0.20) - Math.round(TOTAL_ACTIVITIES * 0.15) },
	]);

	const actStatusPool: ActivityStatus[] = weightedPool([
		{ value: ActivityStatus.DONE, count: Math.round(TOTAL_ACTIVITIES * 0.65) },
		{ value: ActivityStatus.OPEN, count: TOTAL_ACTIVITIES - Math.round(TOTAL_ACTIVITIES * 0.65) },
	]);

	const activitySubjects: Partial<Record<ActivityType, string[]>> = {
		[ActivityType.CALL]:    ["Discovery Call", "Follow-up Call", "Demo Call", "Check-in Call", "Negotiation Call", "Renewal Discussion", "Onboarding Call"],
		[ActivityType.EMAIL]:   ["Proposal Sent", "Follow-up Email", "Introduction Email", "Meeting Invite", "Quote Sent", "Contract Sent", "Thank You Email"],
		[ActivityType.MEETING]: ["Product Demo", "Strategy Meeting", "Quarterly Review", "Kickoff Meeting", "Executive Briefing", "Contract Review", "Onboarding Session"],
		[ActivityType.TASK]:    ["Prepare Proposal", "Update CRM", "Research Account", "Send Contract", "Follow Up on Quote", "Schedule Demo", "Review Feedback"],
		[ActivityType.NOTE]:    ["Meeting Notes", "Call Summary", "Account Update", "Decision Maker Info", "Competitive Notes", "Budget Discussion Notes"],
	};

	// Increasing activity volume over 12 months
	const activityBuckets = [
		{ start: monthsAgo(12), end: monthsAgo(10), count: 100 },
		{ start: monthsAgo(10), end: monthsAgo(8),  count: 160 },
		{ start: monthsAgo(8),  end: monthsAgo(6),  count: 200 },
		{ start: monthsAgo(6),  end: monthsAgo(4),  count: 250 },
		{ start: monthsAgo(4),  end: monthsAgo(2),  count: 280 },
		{ start: monthsAgo(2),  end: new Date(),     count: 210 },
	];

	let actIdx = 0;
	for (const bucket of activityBuckets) {
		for (let i = 0; i < bucket.count; i++) {
			const contact = pick(contacts);
			const deal    = Math.random() < 0.6 ? pick(deals) : null;
			const actDate = randomDate(bucket.start, bucket.end);
			const type    = actTypePool[actIdx % actTypePool.length]!;
			const status  = actStatusPool[actIdx % actStatusPool.length]!;
			const subjectList = activitySubjects[type] ?? ["Activity"];
			const subject = `${pick(subjectList)} with ${contact.name.split(" ")[0]}`;

			const a = activityRepo.create({
				type,
				subject,
				body:       null,
				priority:   pick(Object.values(ActivityPriority)),
				status,
				dueDate:    actDate.toISOString().split("T")[0]!,
				dueTime:    `${String(randomInt(8, 18)).padStart(2, "0")}:${pick(["00", "15", "30", "45"])}:00`,
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

	console.log("\n✓ Seed complete.");
	console.log(`  Workspace   : ${workspaceId}`);
	console.log(`  Companies   : ${companies.length}`);
	console.log(`  Contacts    : ${contacts.length}`);
	console.log(`  Deals       : ${deals.length} (${wonCount} WON / ${lostCount} LOST / ${openCount} OPEN)`);
	console.log(`  Activities  : ${actIdx}`);
	console.log(`  Users       : ${users.map(u => `${u.fullName} (${u.id})`).join(", ")}`);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
