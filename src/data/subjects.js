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

function buildStages(subjectSlug) {
  return stageDefinitions.map((stage) => ({
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
    topicIndexFile: "/data/pki/topics/index.json"
  },
  {
    slug: "ndc",
    name: "NDC",
    shortName: "NDC",
    icon: Network,
    accent: "indigo",
    description: "NDC practice sets and exam stages.",
    stages: buildStages("ndc"),
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
    stages: buildStages("sc"),
    topicsPath: "/subjects/sc/topics",
    topicIndexFile: "/data/sc/topics/index.json"
  },
  {
    slug: "ca",
    name: "Compliance Audits",
    shortName: "CA",
    icon: KeyRound,
    accent: "amber",
    description: "Compliance audits, controls, frameworks, and security evaluation.",
    stages: buildStages("ca"),
    topicsPath: "/subjects/ca/topics",
    topicIndexFile: "/data/ca/topics/index.json"
  },
  {
    slug: "df",
    name: "Cyber Forensic",
    shortName: "CF",
    icon: Binary,
    accent: "rose",
    description: "Cyber forensic investigation, evidence handling, and incident response.",
    stages: buildStages("df"),
    topicsPath: "/subjects/df/topics",
    topicIndexFile: "/data/df/topics/index.json"
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
