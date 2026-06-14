// Subspecialty classifier.
// Priority chain: journal default → MeSH keywords → title keywords → "general".

import type {
  JournalRow,
  PubMedArticle,
  SubspecialtySlug,
  SubspecialtySource,
} from "./types.js";

interface RuleSet {
  mesh: string[];
  title: string[];
}

// Lower-cased exact-or-substring rules.
// Order in MESH_RULES matters: earlier wins ties when multiple match equally.
const MESH_RULES: Record<SubspecialtySlug, RuleSet> = {
  trauma: {
    mesh: [
      "fractures, bone", "fractures, open", "fractures, closed", "fractures, stress",
      "fractures, comminuted", "femoral fractures", "tibial fractures", "hip fractures",
      "humeral fractures", "radius fractures", "ulna fractures", "wounds and injuries",
      "multiple trauma", "polytrauma", "fracture fixation", "external fixators",
      "internal fixators", "bone nails", "bone plates", "bone screws",
    ],
    title: ["fracture", "polytrauma", "nailing", "plating", "fixation"],
  },
  sports: {
    mesh: [
      "athletic injuries", "anterior cruciate ligament injuries", "meniscus",
      "rotator cuff injuries", "tendinopathy", "sports", "sports medicine",
      "shoulder dislocation", "patellar dislocation", "knee injuries",
      "anterior cruciate ligament", "tibial meniscus injuries",
    ],
    title: ["acl", "meniscus", "rotator cuff", "tendinopathy", "athlet", "sport", "concussion"],
  },
  arthroplasty: {
    mesh: [
      "arthroplasty, replacement", "arthroplasty, replacement, hip",
      "arthroplasty, replacement, knee", "arthroplasty, replacement, shoulder",
      "hip prosthesis", "knee prosthesis", "prosthesis-related infections",
      "reoperation", "joint prosthesis", "osteoarthritis, hip", "osteoarthritis, knee",
    ],
    title: ["arthroplasty", "tha", "tka", "uka", "revision hip", "revision knee", "prosthe", "resurfacing"],
  },
  spine: {
    mesh: [
      "spinal diseases", "spinal fusion", "intervertebral disc", "intervertebral disc displacement",
      "spinal stenosis", "scoliosis", "spondylolisthesis", "lumbar vertebrae",
      "cervical vertebrae", "thoracic vertebrae", "spinal cord injuries", "kyphosis",
    ],
    title: ["spine", "spinal", "lumbar", "cervical", "thoracolumbar", "scoliosis", "discect", "fusion"],
  },
  pediatric: {
    mesh: [
      "pediatrics", "child", "infant", "adolescent", "developmental dysplasia of the hip",
      "legg-calve-perthes disease", "slipped capital femoral epiphyses", "clubfoot",
      "osteochondritis", "osteochondrosis", "growth plate",
    ],
    title: ["pediatric", "paediatric", "ddh", "perthes", "clubfoot", "scfe", "adolescent", "growth plate"],
  },
  "hand-upper": {
    mesh: [
      "hand", "hand injuries", "fingers", "carpal tunnel syndrome", "wrist", "wrist injuries",
      "radius", "ulna", "carpal bones", "tendons", "trigger finger disorder",
      "dupuytren contracture", "scaphoid bone",
    ],
    title: ["hand", "wrist", "finger", "carpal", "scaphoid", "dupuytren", "trigger finger"],
  },
  "foot-ankle": {
    mesh: [
      "foot", "foot diseases", "ankle", "ankle injuries", "ankle joint",
      "hallux valgus", "flatfoot", "achilles tendon", "metatarsus", "plantar fasciitis",
      "foot deformities", "talus",
    ],
    title: ["foot", "ankle", "hallux", "flatfoot", "achilles", "plantar"],
  },
  "shoulder-elbow": {
    mesh: [
      "shoulder", "shoulder joint", "rotator cuff", "shoulder impingement syndrome",
      "elbow", "elbow joint", "tennis elbow", "shoulder dislocation",
    ],
    title: ["shoulder", "elbow", "glenohumeral", "rotator cuff", "subacromial"],
  },
  onc: {
    mesh: [
      "bone neoplasms", "osteosarcoma", "ewing sarcoma", "chondrosarcoma",
      "soft tissue neoplasms", "sarcoma", "giant cell tumor of bone",
    ],
    title: ["tumor", "tumour", "sarcoma", "osteosarcoma", "chondrosarcoma", "metastas", "oncolog"],
  },
  basic: {
    mesh: [
      "bone remodeling", "osteoblasts", "osteoclasts", "tissue engineering",
      "mesenchymal stem cells", "biomechanical phenomena", "cartilage", "chondrocytes",
    ],
    title: ["biomechan", "in vitro", "stem cell", "cadaveric", "finite element", "mechanism"],
  },
  general: {
    mesh: [],
    title: [],
  },
};

const PRIORITY: SubspecialtySlug[] = [
  "onc",
  "spine",
  "pediatric",
  "arthroplasty",
  "trauma",
  "sports",
  "hand-upper",
  "foot-ankle",
  "shoulder-elbow",
  "basic",
  "general",
];

export interface SubspecialtyClassification {
  slug: SubspecialtySlug;
  source: SubspecialtySource;
}

export function classifySubspecialty(
  article: PubMedArticle,
  journal: JournalRow | null
): SubspecialtyClassification {
  // 1. Journal default — when a journal is dedicated, trust it strongly
  //    BUT still check for clear MeSH override (onc, pediatric tumour in AJSM, etc.)
  if (journal?.default_subspecialty) {
    return { slug: journal.default_subspecialty as SubspecialtySlug, source: "journal" };
  }

  // 2. Score by MeSH overlap
  const mesh = article.mesh_headings.map((m) => m.toLowerCase());
  const titleLc = article.title.toLowerCase();
  const scores: Record<SubspecialtySlug, number> = {
    trauma: 0, sports: 0, arthroplasty: 0, spine: 0, pediatric: 0,
    "hand-upper": 0, "foot-ankle": 0, "shoulder-elbow": 0,
    onc: 0, basic: 0, general: 0,
  };

  for (const slug of PRIORITY) {
    if (slug === "general") continue;
    const rules = MESH_RULES[slug];
    for (const m of rules.mesh) {
      if (mesh.some((h) => h === m || h.includes(m))) scores[slug] += 3;
    }
    for (const t of rules.title) {
      if (titleLc.includes(t)) scores[slug] += 1;
    }
  }

  let bestSlug: SubspecialtySlug = "general";
  let bestScore = 0;
  for (const slug of PRIORITY) {
    if (slug === "general") continue;
    if (scores[slug] > bestScore) {
      bestScore = scores[slug];
      bestSlug = slug;
    }
  }

  if (bestScore >= 3) return { slug: bestSlug, source: "mesh" };
  if (bestScore >= 1) return { slug: bestSlug, source: "title" };
  return { slug: "general", source: "default" };
}
