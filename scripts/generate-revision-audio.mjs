import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const subjectSlug = process.argv[2];
if (!subjectSlug) {
  console.error("Usage: node scripts/generate-revision-audio.mjs <subject-slug>");
  process.exit(1);
}

const CACHE_DIR = path.join(ROOT, ".tts-cache", "piper");
const TMP_DIR = path.join(ROOT, "tmp-audio", subjectSlug);
const AUDIO_DIR = path.join(ROOT, "public", "audio", subjectSlug);
const INDEX_FILE = path.join(ROOT, "public", "data", subjectSlug, "revision", "index.json");

const PIPER_ZIP_URL = "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip";
const VOICE_BASE_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium";
const VOICE_NAME = "en_US-lessac-medium";
const PIPER_ZIP = path.join(CACHE_DIR, "piper_windows_amd64.zip");
const MODEL_FILE = path.join(CACHE_DIR, "voices", `${VOICE_NAME}.onnx`);
const MODEL_CONFIG_FILE = path.join(CACHE_DIR, "voices", `${VOICE_NAME}.onnx.json`);

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function download(url, destination) {
  if (await exists(destination)) return;
  await fs.mkdir(path.dirname(destination), { recursive: true });
  console.log(`Downloading ${url}`);
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`Download failed: ${url} (${response.status})`);
  await new Promise((resolve, reject) => {
    const stream = createWriteStream(destination);
    response.body.pipeTo(new WritableStream({
      write(chunk) {
        stream.write(Buffer.from(chunk));
      },
      close() {
        stream.end(resolve);
      },
      abort(error) {
        stream.destroy(error);
        reject(error);
      }
    })).catch(reject);
  });
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: options.input ? ["pipe", "inherit", "inherit"] : "inherit" });
    if (options.input) {
      child.stdin.write(options.input);
      child.stdin.end();
    }
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

async function findPiperExe(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const found = await findPiperExe(fullPath);
      if (found) return found;
    }
    if (entry.isFile() && entry.name.toLowerCase() === "piper.exe") return fullPath;
  }
  return null;
}

async function ensurePiper() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await download(PIPER_ZIP_URL, PIPER_ZIP);
  await download(`${VOICE_BASE_URL}/${VOICE_NAME}.onnx`, MODEL_FILE);
  await download(`${VOICE_BASE_URL}/${VOICE_NAME}.onnx.json`, MODEL_CONFIG_FILE);

  let piperExe = await findPiperExe(CACHE_DIR);
  if (!piperExe) {
    await run("powershell", [
      "-NoProfile",
      "-Command",
      `Expand-Archive -LiteralPath '${PIPER_ZIP.replaceAll("'", "''")}' -DestinationPath '${CACHE_DIR.replaceAll("'", "''")}' -Force`
    ]);
    piperExe = await findPiperExe(CACHE_DIR);
  }
  if (!piperExe) throw new Error("piper.exe was not found after extracting Piper.");
  return piperExe;
}

function cleanForSpeech(value) {
  return String(value || "")
    .replace(/[→⇒]/g, " to ")
    .replace(/[↓]/g, " then ")
    .replace(/[↔]/g, " mutual trust with ")
    .replace(/[×]/g, " times ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[✅⭐•*_`#|]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,:;!?])/g, "$1")
    .trim();
}

function uniqueList(items, seen) {
  const output = [];
  for (const item of items || []) {
    const text = cleanForSpeech(item);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    output.push(text);
  }
  return output;
}

function buildNarration(phase) {
  const lines = [
    cleanForSpeech(phase.title),
    `This revision segment contains ${phase.topics.length} exam topics.`
  ];

  phase.topics.forEach((topic, index) => {
    const seen = new Set();
    const title = cleanForSpeech(topic.title);
    const definition = cleanForSpeech(topic.definition);
    lines.push("");
    lines.push(`Topic ${index + 1}. ${title}.`);
    if (definition) {
      seen.add(definition.toLowerCase());
      lines.push(`Definition. ${definition}`);
    }

    const examPoints = uniqueList(topic.examPoints, seen);
    if (examPoints.length) lines.push(`Important exam points. ${examPoints.join(". ")}.`);

    const comparisons = uniqueList(topic.comparisons, seen);
    if (comparisons.length) lines.push(`Comparison. ${comparisons.join(". ")}.`);

    const commands = uniqueList(topic.commands, seen);
    if (commands.length) lines.push(`Commands to remember. ${commands.join(". ")}.`);

    const workflows = uniqueList(topic.workflows, seen);
    if (workflows.length) lines.push(`Workflow. ${workflows.join(". ")}.`);

    const oneLiners = uniqueList(topic.oneLiners, seen);
    if (oneLiners.length) lines.push(`Memory points. ${oneLiners.join(". ")}.`);
  });

  lines.push("");
  lines.push(`End of ${cleanForSpeech(phase.title)}.`);
  return lines.join("\n");
}

async function synthesizePhase(piperExe, phaseInfo) {
  const phasePath = path.join(ROOT, "public", phaseInfo.file.replace(/^\//, "").replaceAll("/", path.sep));
  const phase = JSON.parse(await fs.readFile(phasePath, "utf8"));
  const audioPath = `/audio/${subjectSlug}/${phaseInfo.id}.mp3`;
  const narrationFile = path.join(TMP_DIR, `${phaseInfo.id}.txt`);
  const wavFile = path.join(TMP_DIR, `${phaseInfo.id}.wav`);
  const mp3File = path.join(AUDIO_DIR, `${phaseInfo.id}.mp3`);

  phase.audio = audioPath;
  phaseInfo.audio = audioPath;
  await fs.writeFile(phasePath, `${JSON.stringify(phase, null, 2)}\n`, "utf8");

  await fs.mkdir(TMP_DIR, { recursive: true });
  await fs.mkdir(AUDIO_DIR, { recursive: true });
  await fs.writeFile(narrationFile, buildNarration(phase), "utf8");

  console.log(`Synthesizing ${phaseInfo.id}.wav`);
  const narration = await fs.readFile(narrationFile, "utf8");
  await run(piperExe, ["--model", MODEL_FILE, "--config", MODEL_CONFIG_FILE, "--output_file", wavFile], { input: narration });

  console.log(`Encoding ${phaseInfo.id}.mp3`);
  await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", wavFile, "-codec:a", "libmp3lame", "-q:a", "4", mp3File]);
}

async function main() {
  const piperExe = await ensurePiper();
  const index = JSON.parse(await fs.readFile(INDEX_FILE, "utf8"));

  for (const phase of index.phases || []) {
    await synthesizePhase(piperExe, phase);
  }

  await fs.writeFile(INDEX_FILE, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(`${subjectSlug.toUpperCase()} revision audio generated.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
