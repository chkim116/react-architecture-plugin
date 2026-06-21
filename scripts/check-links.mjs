#!/usr/bin/env node
// 문서 링크 검증기 (의존성 0)
//
// 검사 대상은 skills/doc-update/reference/LINK-CONVENTIONS.md 규칙과 1:1로 대응한다.
//   1) reference ↔ reference: 마크다운 링크 [텍스트](상대경로[#앵커]) — 파일 디렉토리 기준 resolve
//   2) SKILL.md → reference:  백틱 `...reference/....md` — 플러그인 루트 기준 resolve
//
// 검사 항목:
//   - 링크가 가리키는 파일이 실제로 존재하는가 (파일 없음)
//   - 링크에 #앵커가 있으면, 대상 문서에 해당 heading(GitHub 슬러그)이 존재하는가 (앵커 없음)
//   - 고아 reference 문서: 어떤 SKILL/문서/README도 참조하지 않는 문서 (AUTHORING 수동 레시피 자동화)
//   - README 카탈로그 이름 ↔ 실제 파일 stem 불일치 (LINK-CONVENTIONS §3 자동화)
// 문제가 1건이라도 있으면 exit 1.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IGNORE_DIRS = new Set(['.git', 'node_modules', 'scripts']);

/** 레포 내 모든 .md 파일의 절대경로를 수집한다. */
function collectMarkdown(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectMarkdown(full));
    } else if (entry.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

/** 1-based 줄 번호를 문자 인덱스로부터 계산한다. */
function lineOf(content, index) {
  return content.slice(0, index).split('\n').length;
}

/** 코드 펜스(```...```)를 같은 길이 공백으로 치환(줄바꿈 보존). 코드 안의 #는 heading이 아니다. */
function maskFences(content) {
  return content.replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, ' '));
}

/** 펜스 + 인라인 코드(`...`)를 모두 치환. 코드 안의 예시 링크를 실제 링크로 오인하지 않기 위함. */
function maskCode(content) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return maskFences(content).replace(/`[^`\n]*`/g, blank);
}

/**
 * heading 텍스트를 GitHub 앵커 슬러그로 변환한다(github-slugger 호환 근사).
 * 인라인 코드/강조/링크 표기는 제거하되 텍스트는 보존, 소문자화, 문자·숫자·공백·하이픈만 남기고 공백→하이픈.
 */
function slugify(heading) {
  const text = heading
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/_([^_]*)_/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M} \-]/gu, '')
    .replace(/ /g, '-');
}

const slugCache = new Map();

/** 대상 문서의 모든 heading 슬러그 집합을 구한다(중복 heading은 -1, -2 … 접미사). */
function headingSlugs(file) {
  if (slugCache.has(file)) return slugCache.get(file);
  const slugs = new Set();
  const counts = new Map();
  const content = maskFences(readFileSync(file, 'utf8'));
  for (const m of content.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const base = slugify(m[1]);
    if (!base) continue;
    if (counts.has(base)) {
      const n = counts.get(base);
      counts.set(base, n + 1);
      slugs.add(`${base}-${n}`);
    } else {
      counts.set(base, 1);
      slugs.add(base);
    }
  }
  slugCache.set(file, slugs);
  return slugs;
}

const MD_LINK = /\[[^\]]*\]\(([^)]+)\)/g;
const SKILL_PATH = /`([^`]*\/reference\/[^`]+\.md)`/g;

const broken = [];

for (const file of collectMarkdown(ROOT)) {
  const content = readFileSync(file, 'utf8');
  const isSkill = /(^|\/)SKILL\.md$/.test(file);

  // 1) 마크다운 링크 — 파일 디렉토리 기준 (코드 영역의 예시 링크는 제외)
  for (const m of maskCode(content).matchAll(MD_LINK)) {
    const raw = m[1].trim();
    if (/^(https?:|mailto:|#)/.test(raw)) continue; // 외부 링크/순수 앵커 스킵
    const [path, anchor] = raw.split('#');
    if (!path || !path.endsWith('.md')) continue; // .md 링크만 검사
    if (/[*{}]/.test(path)) continue; // glob/템플릿 예시(`./{module}.md` 등)는 실제 링크가 아님
    const resolved = resolve(dirname(file), path);
    if (!existsSync(resolved)) {
      broken.push({ file, line: lineOf(content, m.index), target: raw, kind: '파일 없음' });
      continue;
    }
    if (anchor && !headingSlugs(resolved).has(anchor)) {
      broken.push({ file, line: lineOf(content, m.index), target: raw, kind: '앵커 없음' });
    }
  }

  // 2) SKILL.md 백틱 루트경로 — 플러그인 루트 기준
  if (isSkill) {
    for (const m of content.matchAll(SKILL_PATH)) {
      const target = m[1].trim();
      if (/[*{}]/.test(target)) continue; // glob/템플릿 예시(`*/reference/*.md` 등)는 실제 경로가 아님
      if (!existsSync(resolve(ROOT, target))) {
        broken.push({ file, line: lineOf(content, m.index), target, kind: 'SKILL 경로 없음' });
      }
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────
// 추가 검사: 문서 일관성 (깨진 링크가 못 잡는 표면 — AUTHORING/LINK-CONVENTIONS의 수동 규칙 자동화)
//   (a) 고아 reference 문서 — 어떤 SKILL.md·다른 reference 문서·README에서도 이름이 참조되지 않음
//       (AUTHORING.md "수동 일관성 grep 레시피"의 고아 검사를 자동화)
//   (b) README 카탈로그 이름 ↔ 실제 파일 stem 불일치 — 죽은(이름 바뀐/삭제된) 문서를 가리킴
//       (LINK-CONVENTIONS.md §3 "이름은 실제 파일 stem과 정확히 일치"를 자동화)
//   링크 검사가 README 이름(확장자 없음)·고아를 못 보므로 여기서 함께 막는다.
// ──────────────────────────────────────────────────────────────────────────

const allMd = collectMarkdown(ROOT);
const refDocs = allMd.filter((f) => f.includes('/reference/'));
const refStems = new Set(refDocs.map((f) => f.split('/').pop().replace(/\.md$/, '')));

// (a) 고아: 참조처 후보(SKILL.md + 모든 reference 문서 + README)에서 파일명이 한 번도 안 나오면 고아
const referencers = allMd.filter(
  (f) => /(^|\/)SKILL\.md$/.test(f) || f.includes('/reference/') || /(^|\/)README\.md$/.test(f),
);
const referencerText = new Map(referencers.map((f) => [f, readFileSync(f, 'utf8')]));
for (const doc of refDocs) {
  const base = doc.split('/').pop(); // 예: folder-conventions.md
  const referenced = referencers.some((f) => f !== doc && referencerText.get(f).includes(base));
  if (!referenced) {
    broken.push({ file: doc, line: 1, target: base, kind: '고아 문서(SKILL·다른 문서에서 참조 안 됨)' });
  }
}

// (b) README 카탈로그 이름 검증: 표 행의 kebab-case 토큰은 실제 reference 파일 stem이어야 한다.
//     (작업 설명 칸은 한국어라 매칭되지 않으므로 참조 문서 칸만 사실상 검사된다.)
const readmePath = join(ROOT, 'README.md');
if (existsSync(readmePath)) {
  readFileSync(readmePath, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (!line.trim().startsWith('|')) return; // 카탈로그 표 행만
      for (const m of line.matchAll(/[a-z][a-z0-9]*(?:-[a-z0-9]+)+/g)) {
        if (!refStems.has(m[0])) {
          broken.push({ file: readmePath, line: i + 1, target: m[0], kind: 'README 이름 ↔ 파일 stem 불일치' });
        }
      }
    });
}

if (broken.length === 0) {
  console.log('✓ 링크·일관성 문제 없음');
  process.exit(0);
}

console.error(`✗ 문제 ${broken.length}건:\n`);
for (const b of broken) {
  console.error(`  ${relative(ROOT, b.file)}:${b.line} → ${b.target}  (${b.kind})`);
}
process.exit(1);
