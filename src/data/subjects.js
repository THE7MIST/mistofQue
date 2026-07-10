import {
  Binary,
  Cpu,
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
    slug: "cybersecurity",
    name: "Cyber Security",
    shortName: "Cyber",
    icon: ShieldCheck,
    accent: "teal",
    description: "Threat defense, identity, web security, and incident response.",
    stages: buildStages("cybersecurity"),
    topicsPath: "/subjects/cybersecurity/topics",
    topicIndexFile: "/data/cybersecurity/topics/index.json"
  },
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
    slug: "networking",
    name: "Networking",
    shortName: "Net",
    icon: Network,
    accent: "indigo",
    description: "Protocols, routing, switching, ports, and network security.",
    stages: buildStages("networking"),
    topicsPath: "/subjects/networking/topics",
    topicIndexFile: "/data/networking/topics/index.json"
  },
  {
    slug: "iot",
    name: "IoT",
    shortName: "IoT",
    icon: Cpu,
    accent: "emerald",
    description: "Embedded devices, telemetry, gateways, and edge security.",
    stages: buildStages("iot"),
    topicsPath: "/subjects/iot/topics",
    topicIndexFile: "/data/iot/topics/index.json"
  },
  {
    slug: "cryptography",
    name: "Cryptography",
    shortName: "Crypto",
    icon: Binary,
    accent: "rose",
    description: "Symmetric crypto, hashes, signatures, and key exchange.",
    stages: buildStages("cryptography"),
    topicsPath: "/subjects/cryptography/topics",
    topicIndexFile: "/data/cryptography/topics/index.json"
  }
];

export const sidebarSubjects = subjects.slice(0, 4);

export function getSubject(subjectSlug) {
  return subjects.find((subject) => subject.slug === subjectSlug);
}

export function getStage(subjectSlug, stageSlug) {
  return getSubject(subjectSlug)?.stages.find((stage) => stage.slug === stageSlug);
}

export function getSubjectIcon(subjectSlug) {
  return getSubject(subjectSlug)?.icon || Globe2;
}
