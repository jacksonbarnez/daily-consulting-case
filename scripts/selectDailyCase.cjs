const fs = require("fs");

const today = new Date().toISOString().slice(0, 10);

const caseBankPath = "data/case_bank.json";
const usedCasesPath = "data/used_cases.json";
const todayPath = "public/data/today.json";
const archivePath = "public/data/archive.json";

const caseBank = JSON.parse(fs.readFileSync(caseBankPath, "utf8"));
const usedCases = JSON.parse(fs.readFileSync(usedCasesPath, "utf8"));
const archive = JSON.parse(fs.readFileSync(archivePath, "utf8"));

const alreadyPublishedToday = archive.some((entry) => entry.publish_date === today);

if (alreadyPublishedToday) {
  console.log("A case has already been published today.");
  process.exit(0);
}

const oneYearAgo = new Date();
oneYearAgo.setDate(oneYearAgo.getDate() - 365);

const usedWithin365 = new Set(
  usedCases
    .filter((entry) => new Date(entry.used_on) >= oneYearAgo)
    .map((entry) => entry.case_id)
);

let eligibleCases = caseBank.filter(
  (caseItem) => caseItem.approved === true && !usedWithin365.has(caseItem.id)
);

if (eligibleCases.length === 0) {
  throw new Error("No eligible cases available. Add more cases or relax the 365-day rule.");
}

const yesterday = archive[archive.length - 1];

if (yesterday) {
  const differentCaseType = eligibleCases.filter(
    (caseItem) => caseItem.case_type !== yesterday.case_type
  );

  if (differentCaseType.length > 0) {
    eligibleCases = differentCaseType;
  }
}

const recentSevenCases = archive.slice(-7);
const recentIndustries = new Set(recentSevenCases.map((entry) => entry.industry));

const differentIndustry = eligibleCases.filter(
  (caseItem) => !recentIndustries.has(caseItem.industry)
);

if (differentIndustry.length > 0) {
  eligibleCases = differentIndustry;
}

const selectedCase = eligibleCases[Math.floor(Math.random() * eligibleCases.length)];

const dailyCase = {
  ...selectedCase,
  publish_date: today
};

fs.writeFileSync(todayPath, JSON.stringify(dailyCase, null, 2));
archive.push(dailyCase);
fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));

usedCases.push({
  case_id: selectedCase.id,
  used_on: today
});

fs.writeFileSync(usedCasesPath, JSON.stringify(usedCases, null, 2));

console.log(`Published case: ${selectedCase.title}`);