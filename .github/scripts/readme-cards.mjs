#!/usr/bin/env node
/**
 * Self-hosted GitHub profile README cards.
 *
 * Fetches public stats for a user from the GitHub GraphQL API and renders four
 * static SVG cards (stats and top languages, dark and light) that match the
 * profile hero. Zero dependencies; requires Node >= 20 (global fetch).
 *
 * Environment:
 *   GITHUB_TOKEN  required. Any token that can read public data works, including
 *                 the Actions GITHUB_TOKEN. The query uses `user(login:)`, never
 *                 `viewer`, because an Actions token is not a user token.
 *   GH_USER       GitHub login to render (default: MrNizzy).
 *   OUT_DIR       output directory (default: .github/readme).
 *
 * Behavior guarantees:
 *   - PUBLIC DATA ONLY. Every figure is scoped to public repositories in the
 *     query itself (search `is:public`, `privacy: PUBLIC`, and a strict
 *     `isPrivate === false` filter on commits), so the output is identical for a
 *     local user token and for the Actions GITHUB_TOKEN. The committed cards
 *     never encode private activity.
 *   - Any HTTP error, GraphQL error or null user exits 1 BEFORE touching disk,
 *     so the previously committed SVGs stay in place.
 *   - All four SVGs are rendered in memory first, then written.
 *   - Output is deterministic for the same data (no timestamps, no random ids),
 *     so a workflow can commit only when the numbers actually change.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const API_URL = 'https://api.github.com/graphql';
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_PAGES = 50; // safety cap: 50 pages x 100 repos
const COMMIT_REPO_CAP = 100; // GraphQL maximum for maxRepositories
const TOP_LANGUAGES = 5;

// ---------------------------------------------------------------------------
// Design tokens (match .github/readme/hero-*.svg)
// ---------------------------------------------------------------------------

const FONT =
  "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif";

const THEMES = {
  dark: {
    surface: '#161B22',
    border: '#30363D',
    fg: '#E6EDF3',
    muted: '#8B949E',
    title: '#F472A6',
    accent: '#22D3EE',
    other: '#8B949E',
    // Categorical order is FIXED: slot 1 is always the largest language.
    series: ['#DB2777', '#0891B2', '#7C3AED', '#059669', '#EA580C'],
  },
  light: {
    surface: '#F6F8FA',
    border: '#D0D7DE',
    fg: '#1F2328',
    muted: '#59636E',
    title: '#BE185D',
    accent: '#0E7490',
    other: '#8C959F',
    series: ['#BE185D', '#0891B2', '#7C3AED', '#059669', '#C2410C'],
  },
};

const NUMBER = new Intl.NumberFormat('en-US');
const PERCENT = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// ---------------------------------------------------------------------------
// GitHub GraphQL
// ---------------------------------------------------------------------------

// Counts are requested on the first page only (@include) so pagination stays cheap.
// Everything here is public-only by construction: `is:public` in the searches,
// `privacy: PUBLIC` on repositories, and `isPrivate` on each commit repository
// (filtered in code). Nothing depends on what the token itself can see.
const QUERY = /* GraphQL */ `
  query ReadmeCards($login: String!, $cursor: String, $withCounts: Boolean!, $prQuery: String!, $issueQuery: String!) {
    pullRequests: search(query: $prQuery, type: ISSUE) @include(if: $withCounts) { issueCount }
    issues: search(query: $issueQuery, type: ISSUE) @include(if: $withCounts) { issueCount }
    user(login: $login) {
      contributionsCollection @include(if: $withCounts) {
        commitContributionsByRepository(maxRepositories: ${COMMIT_REPO_CAP}) {
          repository { isPrivate }
          contributions { totalCount }
        }
      }
      repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
        totalCount
        pageInfo { hasNextPage endCursor }
        nodes {
          stargazerCount
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name } }
          }
        }
      }
    }
  }
`;

async function graphql(token, variables) {
  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'readme-cards',
      },
      body: JSON.stringify({ query: QUERY, variables }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    throw new Error(`GitHub API request failed: ${err.message}`);
  }

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`GitHub API responded ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
  }

  let json;
  try {
    json = JSON.parse(body);
  } catch {
    throw new Error('GitHub API returned a response that is not valid JSON');
  }
  if (Array.isArray(json.errors) && json.errors.length > 0) {
    throw new Error(`GitHub GraphQL errors: ${json.errors.map((e) => e.message).join('; ')}`);
  }
  if (!json.data || !json.data.user) {
    throw new Error(`GitHub user "${variables.login}" was not found (user is null)`);
  }
  return json.data;
}

function count(value, name) {
  if (!Number.isFinite(value)) {
    throw new Error(`Unexpected GitHub response: "${name}" is not a number`);
  }
  return value;
}

/** Commits in the last year, counted over PUBLIC repositories only. */
function sumPublicCommits(user) {
  const entries = user.contributionsCollection?.commitContributionsByRepository;
  if (!Array.isArray(entries)) {
    throw new Error('Unexpected GitHub response: commitContributionsByRepository is missing');
  }

  let commits = 0;
  for (const entry of entries) {
    // Fail closed: only an explicit `false` counts. true, null or missing is excluded.
    if (entry?.repository?.isPrivate !== false) continue;
    commits += count(entry.contributions?.totalCount, 'contributions.totalCount');
  }

  if (entries.length >= COMMIT_REPO_CAP) {
    console.warn(
      `readme-cards: warning: commitContributionsByRepository hit its ${COMMIT_REPO_CAP}-repository cap; the commit total may be undercounted`,
    );
  }
  return commits;
}

async function fetchData(token, login) {
  // The login is interpolated into search qualifiers, so refuse anything that is
  // not a plain GitHub login (this blocks injecting extra qualifiers such as `is:private`).
  if (!/^[A-Za-z0-9_-]{1,39}$/.test(login)) {
    throw new Error(`GH_USER "${login}" is not a valid GitHub login`);
  }
  const prQuery = `author:${login} is:pr is:public`;
  const issueQuery = `author:${login} is:issue is:public`;

  let cursor = null;
  let counts = null;
  let stars = 0;
  const bytesByLanguage = new Map();

  for (let page = 0; ; page += 1) {
    if (page >= MAX_PAGES) {
      throw new Error(`Aborting: more than ${MAX_PAGES} pages of repositories`);
    }
    const data = await graphql(token, { login, cursor, withCounts: page === 0, prQuery, issueQuery });
    const user = data.user;

    const repos = user.repositories;
    if (!repos || !Array.isArray(repos.nodes) || !repos.pageInfo) {
      throw new Error('Unexpected GitHub response: repositories connection is malformed');
    }

    if (page === 0) {
      counts = {
        pullRequests: count(data.pullRequests?.issueCount, 'pullRequests.issueCount'),
        issues: count(data.issues?.issueCount, 'issues.issueCount'),
        commits: sumPublicCommits(user),
        publicRepos: count(repos.totalCount, 'repositories.totalCount'),
      };
    }

    for (const repo of repos.nodes) {
      if (!repo) continue;
      stars += count(repo.stargazerCount, 'stargazerCount');
      for (const edge of repo.languages?.edges ?? []) {
        const name = edge?.node?.name;
        if (!name) continue;
        bytesByLanguage.set(name, (bytesByLanguage.get(name) ?? 0) + count(edge.size, 'language size'));
      }
    }

    if (!repos.pageInfo.hasNextPage) break;
    cursor = repos.pageInfo.endCursor;
    if (!cursor) throw new Error('Unexpected GitHub response: hasNextPage without endCursor');
  }

  return { ...counts, stars, bytesByLanguage };
}

// ---------------------------------------------------------------------------
// Data shaping
// ---------------------------------------------------------------------------

/**
 * Top N languages by bytes, everything else folded into a single "Other" slot.
 * Sorting is total (bytes desc, then name asc) so output is deterministic.
 */
function buildLanguageSlots(bytesByLanguage) {
  const sorted = [...bytesByLanguage]
    .filter(([, bytes]) => bytes > 0)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  const total = sorted.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (total === 0) return [];

  const slots = sorted.slice(0, TOP_LANGUAGES).map(([name, bytes]) => ({ name, bytes, other: false }));
  const restBytes = sorted.slice(TOP_LANGUAGES).reduce((sum, [, bytes]) => sum + bytes, 0);
  if (restBytes > 0) slots.push({ name: 'Other', bytes: restBytes, other: true });

  return slots.map((slot) => ({ ...slot, share: slot.bytes / total, percent: (slot.bytes / total) * 100 }));
}

function percentLabel(percent) {
  // Never show a misleading "0.0%" for a language that exists.
  return percent > 0 && percent < 0.05 ? '<0.1%' : `${PERCENT.format(percent)}%`;
}

function plural(n, one, many) {
  return n === 1 ? one : many;
}

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Round to 2 decimals for compact, stable geometry. */
function r2(value) {
  return String(Math.round(value * 100) / 100);
}

/**
 * Rough text width in px. Deliberately a little wide so the layout stays safe on
 * the fallback fonts (Helvetica, Arial) that GitHub viewers on other systems use.
 */
function estimateWidth(text, size) {
  let em = 0;
  for (const ch of text) {
    if ('iljI.,;:!\'|`'.includes(ch)) em += 0.3;
    else if ('ftr()[]{}-/\\ '.includes(ch)) em += 0.38;
    else if ('mwMW@%…'.includes(ch)) em += 0.9;
    else if (/[A-Z]/.test(ch)) em += 0.66;
    else if (/[0-9]/.test(ch)) em += 0.58;
    else em += 0.56;
  }
  return em * size;
}

/** Escape and, if it would not fit in maxWidth, truncate with an ellipsis. */
function fitText(text, maxWidth, size) {
  if (estimateWidth(text, size) <= maxWidth) return escapeXml(text);
  const chars = Array.from(text);
  while (chars.length > 1 && estimateWidth(`${chars.join('')}…`, size) > maxWidth) chars.pop();
  return `${escapeXml(chars.join('').trimEnd())}&#8230;`;
}

/** 16x16 outline icons, drawn inside a group that sets stroke, width and caps. */
const ICONS = {
  star: '<path d="M8 1.5L10 5.75L14.66 6.34L11.23 9.55L12.11 14.16L8 11.9L3.89 14.16L4.77 9.55L1.34 6.34L6 5.75Z" />',
  commit: '<circle cx="8" cy="8" r="3" /><path d="M1 8h4M11 8h4" />',
  pr:
    '<circle cx="4" cy="3.5" r="1.75" /><circle cx="4" cy="12.5" r="1.75" /><circle cx="12" cy="12.5" r="1.75" />' +
    '<path d="M4 5.25v5.5" /><path d="M12 10.75V6.5a2 2 0 0 0-2-2H8.5" /><path d="M10 2.5L8 4.5l2 2" />',
  issue: '<circle cx="8" cy="8" r="6.25" /><circle cx="8" cy="8" r="1" />',
  repo:
    '<path d="M3 12.5V3.5A1.5 1.5 0 0 1 4.5 2H13v9H4.5A1.5 1.5 0 0 0 3 12.5" />' +
    '<path d="M3 12.5A1.5 1.5 0 0 0 4.5 14H13v-3" />',
};

function cardShell(theme, label, body, defs = '') {
  const text = escapeXml(label);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 200" width="480" height="200" role="img" aria-label="${text}">
  <title>${text}</title>
  <defs>
    <style>.num { font-variant-numeric: tabular-nums; }</style>${defs}
  </defs>
  <rect x="0.5" y="0.5" width="479" height="199" rx="16" fill="${theme.surface}" stroke="${theme.border}" stroke-width="1" />
  <g font-family="${FONT}">
${body}
  </g>
</svg>
`;
}

function titleText(theme, title) {
  return `    <text x="24" y="40" font-size="18" font-weight="600" fill="${theme.title}">${escapeXml(title)}</text>`;
}

// ---------------------------------------------------------------------------
// Card: GitHub stats
// ---------------------------------------------------------------------------

function renderStatsCard(theme, data) {
  const rows = [
    { icon: 'star', label: 'Stars earned', value: data.stars },
    { icon: 'commit', label: 'Commits (last year)', value: data.commits },
    { icon: 'pr', label: 'Pull requests', value: data.pullRequests },
    { icon: 'issue', label: 'Issues', value: data.issues },
    { icon: 'repo', label: 'Original repositories', value: data.publicRepos },
  ];

  const lines = [titleText(theme, 'GitHub stats')];
  rows.forEach((row, i) => {
    const y = 78 + i * 26;
    lines.push(
      `    <g transform="translate(24 ${y - 13})" fill="none" stroke="${theme.accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[row.icon]}</g>`,
      `    <text x="50" y="${y}" font-size="14" fill="${theme.muted}">${escapeXml(row.label)}</text>`,
      `    <text class="num" x="456" y="${y}" text-anchor="end" font-size="14" font-weight="600" fill="${theme.fg}">${escapeXml(NUMBER.format(row.value))}</text>`,
    );
  });

  const n = (value) => NUMBER.format(value);
  const label =
    `GitHub stats: ${n(data.stars)} ${plural(data.stars, 'star', 'stars')} earned, ` +
    `${n(data.commits)} ${plural(data.commits, 'commit', 'commits')} in the last year, ` +
    `${n(data.pullRequests)} ${plural(data.pullRequests, 'pull request', 'pull requests')}, ` +
    `${n(data.issues)} ${plural(data.issues, 'issue', 'issues')}, ` +
    `${n(data.publicRepos)} ${plural(data.publicRepos, 'original public repository', 'original public repositories')}.`;

  return cardShell(theme, label, lines.join('\n'));
}

// ---------------------------------------------------------------------------
// Card: most used languages
// ---------------------------------------------------------------------------

const BAR = { x: 24, y: 62, width: 432, height: 10, gap: 2 };
const LEGEND = {
  firstBaseline: 108,
  rowStep: 28,
  rows: 3,
  // Column-major: the ranking reads top to bottom, then continues in column 2.
  columns: [
    { start: 24, end: 224 },
    { start: 248, end: 456 },
  ],
  dotRadius: 5,
  nameOffset: 14, // from the dot center
  fontSize: 14,
};

function renderLangsCard(theme, slots) {
  const lines = [titleText(theme, 'Most used languages')];
  const defs = `\n    <clipPath id="bar-clip"><rect x="${BAR.x}" y="${BAR.y}" width="${BAR.width}" height="${BAR.height}" rx="${BAR.height / 2}" /></clipPath>`;

  const colorOf = (slot, i) => (slot.other ? theme.other : theme.series[i]);

  if (slots.length === 0) {
    lines.push(
      `    <rect x="${BAR.x}" y="${BAR.y}" width="${BAR.width}" height="${BAR.height}" rx="${BAR.height / 2}" fill="${theme.border}" />`,
      `    <text x="24" y="${LEGEND.firstBaseline}" font-size="14" fill="${theme.muted}">No language data yet</text>`,
    );
    return cardShell(theme, 'Most used languages: no language data yet.', lines.join('\n'), defs);
  }

  // 100% stacked bar. The 2px gap is a real gap (the surface shows through):
  // every segment except the last is drawn 2px narrower than its share.
  const segments = [];
  let x = BAR.x;
  slots.forEach((slot, i) => {
    const isLast = i === slots.length - 1;
    const slotWidth = slot.share * BAR.width;
    const drawWidth = isLast ? BAR.x + BAR.width - x : Math.max(slotWidth - BAR.gap, 1);
    segments.push(
      `      <rect x="${r2(x)}" y="${BAR.y}" width="${r2(drawWidth)}" height="${BAR.height}" fill="${colorOf(slot, i)}" />`,
    );
    x += slotWidth;
  });
  lines.push(`    <g clip-path="url(#bar-clip)">`, ...segments, `    </g>`);

  // Legend = the table view: every slot shows its exact percentage.
  slots.forEach((slot, i) => {
    const column = LEGEND.columns[Math.floor(i / LEGEND.rows)];
    const y = LEGEND.firstBaseline + (i % LEGEND.rows) * LEGEND.rowStep;
    const percent = percentLabel(slot.percent);
    const nameX = column.start + LEGEND.dotRadius + LEGEND.nameOffset;
    const maxNameWidth = column.end - estimateWidth(percent, LEGEND.fontSize) - 10 - nameX;

    lines.push(
      `    <circle cx="${column.start + LEGEND.dotRadius}" cy="${y - 5}" r="${LEGEND.dotRadius}" fill="${colorOf(slot, i)}" />`,
      `    <text x="${nameX}" y="${y}" font-size="14" fill="${theme.fg}">${fitText(slot.name, maxNameWidth, LEGEND.fontSize)}</text>`,
      `    <text class="num" x="${column.end}" y="${y}" text-anchor="end" font-size="14" fill="${theme.muted}">${escapeXml(percent)}</text>`,
    );
  });

  const label = `Most used languages: ${slots
    .map((slot) => `${slot.name} ${percentLabel(slot.percent).replace('<', 'less than ')}`)
    .join(', ')}.`;

  return cardShell(theme, label, lines.join('\n'), defs);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('readme-cards: GITHUB_TOKEN is required (a token that can read public GitHub data).');
    process.exit(1);
  }
  const login = process.env.GH_USER || 'MrNizzy';
  const outDir = process.env.OUT_DIR || '.github/readme';

  const data = await fetchData(token, login);
  const slots = buildLanguageSlots(data.bytesByLanguage);

  // Render everything first so a bug never leaves a half-written set of files.
  const files = {
    'stats-dark.svg': renderStatsCard(THEMES.dark, data),
    'stats-light.svg': renderStatsCard(THEMES.light, data),
    'langs-dark.svg': renderLangsCard(THEMES.dark, slots),
    'langs-light.svg': renderLangsCard(THEMES.light, slots),
  };

  await mkdir(outDir, { recursive: true });
  for (const [name, svg] of Object.entries(files)) {
    await writeFile(join(outDir, name), svg, 'utf8');
  }

  console.log(`readme-cards: ${login}`);
  console.log(`  stars earned:    ${NUMBER.format(data.stars)}`);
  console.log(`  commits (1y):    ${NUMBER.format(data.commits)}`);
  console.log(`  pull requests:   ${NUMBER.format(data.pullRequests)}`);
  console.log(`  issues:          ${NUMBER.format(data.issues)}`);
  console.log(`  public repos:    ${NUMBER.format(data.publicRepos)}`);
  console.log(`  languages:       ${slots.map((s) => `${s.name} ${percentLabel(s.percent)}`).join(', ') || 'none'}`);
  console.log(`  wrote ${Object.keys(files).length} files to ${outDir}`);
}

main().catch((err) => {
  console.error(`readme-cards: ${err.message}`);
  process.exit(1);
});
