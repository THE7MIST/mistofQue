import {
  Binary,
  Globe2,
  KeyRound,
  Network,
  ShieldCheck
} from "lucide-react";

const stageDefinitions = [
  { slug: "warmup", label: "Warm Up MCQ", tone: "teal" },
  { slug: "quarterfinal", label: "Quarter Final", tone: "amber" },
  { slug: "semifinal", label: "Semi Final", tone: "rose" },
  { slug: "finalboss", label: "Final Boss", tone: "emerald" }
];

function buildStages(subjectSlug, stageSlugs = stageDefinitions.map((stage) => stage.slug)) {
  return stageDefinitions.filter((stage) => stageSlugs.includes(stage.slug)).map((stage) => ({
    ...stage,
    path: `/subjects/${subjectSlug}/${stage.slug}`,
    file: `/data/${subjectSlug}/${stage.slug}.json`
  }));
}

export const subjects = [
  {
    slug: "pki",
    name: "PKI",
    shortName: "PKI",
    icon: KeyRound,
    accent: "amber",
    description: "Certificates, trust chains, revocation, and secure handshakes.",
    stages: buildStages("pki"),
    topicsPath: "/subjects/pki/topics",
    topicIndexFile: "/data/pki/topics/index.json",
    revisionPath: "/subjects/pki/revision",
    revisionIndexFile: "/data/pki/revision/index.json"
  },
  {
    slug: "ndc",
    name: "NDC",
    shortName: "NDC",
    icon: Network,
    accent: "indigo",
    description: "NDC practice sets and exam stages.",
    stages: buildStages("ndc", ["warmup"]),
    topicsPath: "/subjects/ndc/topics",
    topicIndexFile: "/data/ndc/topics/index.json"
  },
  {
    slug: "sc",
    name: "Security Concepts",
    shortName: "SC",
    icon: ShieldCheck,
    accent: "teal",
    description: "Security concepts, web testing, malware, wireless, and mobile security.",
    stages: buildStages("sc", ["warmup", "semifinal", "finalboss"]),
    topicsPath: "/subjects/sc/topics",
    topicIndexFile: "/data/sc/topics/index.json",
    revisionPath: "/subjects/sc/revision",
    revisionIndexFile: "/data/sc/revision/index.json"
  },
  {
    slug: "ca",
    name: "Compliance Audits",
    shortName: "CA",
    icon: KeyRound,
    accent: "amber",
    description: "Compliance audits, controls, frameworks, and security evaluation.",
    stages: buildStages("ca", ["warmup"]),
    topicsPath: "/subjects/ca/topics",
    topicIndexFile: "/data/ca/topics/index.json",
    revisionPath: "/subjects/ca/revision",
    revisionIndexFile: "/data/ca/revision/index.json"
  },
  {
    slug: "df",
    name: "Cyber Forensic",
    shortName: "CF",
    icon: Binary,
    accent: "rose",
    description: "Cyber forensic investigation, evidence handling, and incident response.",
    stages: buildStages("df", []),
    topicsPath: "/subjects/df/topics",
    topicIndexFile: "/data/df/topics/index.json"
  },
  {
    slug: "ml",
    name: "ML",
    shortName: "ML",
    group: "BDA",
    icon: Binary,
    accent: "indigo",
    description: "Machine learning foundations, regression, validation, clustering, trees, and neural networks.",
    stages: buildStages("ml", []),
    topicsPath: "/subjects/ml/topics",
    topicIndexFile: "/data/ml/topics/index.json"
  }
];

export const sidebarSubjects = subjects;

export function getSubject(subjectSlug) {
  return subjects.find((subject) => subject.slug === subjectSlug);
}

export function getStage(subjectSlug, stageSlug) {
  return getSubject(subjectSlug)?.stages.find((stage) => stage.slug === stageSlug);
}

export function getSubjectIcon(subjectSlug) {
  return getSubject(subjectSlug)?.icon || Globe2;
}
