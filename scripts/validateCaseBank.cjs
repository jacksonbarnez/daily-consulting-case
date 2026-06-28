const fs = require("fs");

const caseBank = JSON.parse(fs.readFileSync("data/case_bank.json", "utf8"));

const requiredFields = [
  "id",
  "title",
  "case_type",
  "industry",
  "difficulty",
  "background",
  "candidate_prompt",
  "good_answer_includes",
  "great_answer_includes",
  "interviewer_notes",
  "approved"
];

const ids = new Set();

for (const caseItem of caseBank) {
  for (const field of requiredFields) {
    if (!(field in caseItem)) {
      throw new Error(`Case ${caseItem.id || "UNKNOWN"} is missing field: ${field}`);
    }
  }

  if (ids.has(caseItem.id)) {
    throw new Error(`Duplicate case id found: ${caseItem.id}`);
  }

  ids.add(caseItem.id);

  if (!Array.isArray(caseItem.good_answer_includes)) {
    throw new Error(`good_answer_includes must be an array for ${caseItem.id}`);
  }

  if (!Array.isArray(caseItem.great_answer_includes)) {
    throw new Error(`great_answer_includes must be an array for ${caseItem.id}`);
  }

  if (caseItem.good_answer_includes.length === 0) {
    throw new Error(`good_answer_includes is empty for ${caseItem.id}`);
  }

  if (caseItem.great_answer_includes.length === 0) {
    throw new Error(`great_answer_includes is empty for ${caseItem.id}`);
  }
}

console.log(`Validated ${caseBank.length} cases successfully.`);