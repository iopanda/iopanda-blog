#!/usr/bin/env python3
"""One-shot acceptance check for the AI-notes migration (7 checks)."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import unquote

import yaml

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "src/content/ai"
MANIFEST_PATH = ROOT / "src/data/ai-manifest.json"
SCRIPT = ROOT / "scripts/migrate-ai-notes.py"
OBSIDIAN = Path.home() / "Documents/Obsidian"

FRONTMATTER_RE = re.compile(r"^---\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n)?", re.S)
OLD_NUMBER_RE = re.compile(r"3\.10\.")
# Root-relative /ai/ links only: the lookbehind keeps external URLs such as
# ".../ai/foo.pdf" or code paths like "packages/ai/src" from matching.
URL_RE = re.compile(r"(?<![A-Za-z0-9._/-])/ai/[^\s)\"'<>\]]*")
FILE_PREFIX_RE = re.compile(r"^(\d+)\s+")

results: list[tuple[str, bool, str]] = []


def record(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))


def split_frontmatter(text: str) -> tuple[str | None, str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return None, text
    return match.group(1), text[match.end():]


def main() -> int:
    files = sorted(CONTENT.rglob("*.md"))
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    texts = {path: path.read_text(encoding="utf-8") for path in files}

    # 1. file count and per-chapter counts
    chapter_counts = []
    for chapter in manifest["chapters"]:
        prefix = f"{chapter['number']}-{chapter['slug']}"
        count = sum(1 for path in files if path.relative_to(CONTENT).parts[0] == prefix)
        chapter_counts.append(count)
    expected_counts = [53, 79, 231, 137, 10]
    ok1 = len(files) == 510 and chapter_counts == expected_counts
    record("1 files", ok1, f"{len(files)} .md; chapters {'/'.join(map(str, chapter_counts))}")

    # 2. residual wiki syntax
    residual_wiki = sum(text.count("[[") for text in texts.values())
    record("2 residual [[", residual_wiki == 0, f"{residual_wiki}")

    # 3. internal link targets resolve to manifest pages / images
    valid = set()
    for chapter in manifest["chapters"]:
        chapter_root = f"/ai/{chapter['number']}-{chapter['slug']}"
        valid.add(chapter_root + "/")
        for section in chapter["sections"]:
            valid.add(section["url"])
            for article in section["articles"]:
                valid.add(article["url"])
    valid_images = {image["url"] for image in manifest["images"]}

    checked = 0
    broken: list[str] = []
    for path, text in texts.items():
        _frontmatter, body = split_frontmatter(text)
        for url in URL_RE.findall(body):
            checked += 1
            clean = url.split("#", 1)[0].split("?", 1)[0]
            if clean not in valid and clean not in valid_images:
                broken.append(f"{path.relative_to(ROOT)} -> {url}")
    record("3 internal links", not broken, f"{checked} checked, {len(broken)} broken")
    for item in broken[:10]:
        print("   broken:", item)

    # 4. every frontmatter parses as YAML
    yaml_errors: list[str] = []
    for path, text in texts.items():
        frontmatter, _body = split_frontmatter(text)
        if frontmatter is None:
            yaml_errors.append(f"{path}: missing frontmatter")
            continue
        try:
            data = yaml.safe_load(frontmatter)
        except yaml.YAMLError as exc:
            yaml_errors.append(f"{path}: {exc}")
            continue
        if not isinstance(data, dict):
            yaml_errors.append(f"{path}: not a mapping")
    record("4 frontmatter", not yaml_errors, f"{len(files) - len(yaml_errors)}/{len(files)} parsed")
    for item in yaml_errors[:10]:
        print("   yaml:", item)

    # 5. article numbers 01..N continuous in every section
    sections = 0
    numbering_errors: list[str] = []
    for chapter in manifest["chapters"]:
        chapter_no = chapter["chapter"]
        for section in chapter["sections"]:
            sections += 1
            section_no = section["section"]
            section_dir = CONTENT / f"{chapter_no:02d}-{chapter['slug']}" / f"{section_no:02d}"
            entries = sorted(
                (p for p in section_dir.iterdir() if p.is_file() and p.suffix.lower() == ".md"),
                key=lambda p: int(FILE_PREFIX_RE.match(p.name).group(1))
                if FILE_PREFIX_RE.match(p.name)
                else 10**9,
            )
            seen = []
            for position, path in enumerate(entries, start=1):
                match = FILE_PREFIX_RE.match(path.name)
                if not match:
                    numbering_errors.append(f"{path}: no numeric file prefix")
                    continue
                seen.append(int(match.group(1)))
                frontmatter, _body = split_frontmatter(texts[path])
                data = yaml.safe_load(frontmatter or "") or {}
                expected = f"{chapter_no:02d}.{section_no:02d}.{position:02d}"
                if data.get("number") != expected:
                    numbering_errors.append(
                        f"{path}: number={data.get('number')!r}, expected {expected!r}"
                    )
                if data.get("section") != section_no:
                    numbering_errors.append(
                        f"{path}: section={data.get('section')!r}, expected {section_no}"
                    )
            if seen != list(range(1, len(seen) + 1)):
                numbering_errors.append(f"{section_dir}: prefixes {seen}")
    record(
        "5 section numbering",
        not numbering_errors,
        f"{sections} sections, {len(numbering_errors)} errors",
    )
    for item in numbering_errors[:10]:
        print("   numbering:", item)

    # 6. no old numbering left in article bodies (frontmatter sourceId exempt)
    body_hits = 0
    body_files = 0
    for text in texts.values():
        _frontmatter, body = split_frontmatter(text)
        hits = len(OLD_NUMBER_RE.findall(body))
        body_hits += hits
        body_files += bool(hits)
    record("6 body 3.10.", body_hits == 0, f"{body_hits} in {body_files} files")

    # 7. inputs untouched: git status plus mtimes newer than the migration script
    reference = SCRIPT.stat().st_mtime
    git = subprocess.run(
        ["git", "status", "--porcelain", "--", "import/ai-notes"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    tracked = subprocess.run(
        ["git", "ls-files", "import/ai-notes"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    ).stdout.count("\n")

    def newer_than_reference(base: Path) -> tuple[int, int, str]:
        total = 0
        newer = 0
        newest = 0.0
        for dirpath, _dirnames, filenames in os.walk(base):
            for name in filenames:
                path = os.path.join(dirpath, name)
                try:
                    mtime = os.stat(path).st_mtime
                except OSError:
                    continue
                total += 1
                newest = max(newest, mtime)
                if mtime > reference:
                    newer += 1
        label = datetime.fromtimestamp(newest).strftime("%Y-%m-%d %H:%M:%S") if newest else "-"
        return total, newer, label

    import_total, import_newer, import_newest = newer_than_reference(ROOT / "import/ai-notes")
    obsidian_total, obsidian_newer, obsidian_newest = newer_than_reference(OBSIDIAN)
    ok7 = git.stdout.strip() == "" and import_newer == 0 and obsidian_newer == 0
    record(
        "7 inputs untouched",
        ok7,
        f"git={git.stdout.strip() or 'clean'} (tracked {tracked}); import: {import_total} files, "
        f"{import_newer} newer than script (newest {import_newest}); Obsidian: "
        f"{obsidian_total} files, {obsidian_newer} newer (newest {obsidian_newest})",
    )

    print("\n=== acceptance ===")
    for name, ok, detail in results:
        print(f"[{'PASS' if ok else 'FAIL'}] {name}: {detail}")
    failures = [name for name, ok, _detail in results if not ok]
    print(f"\n{'ALL PASS' if not failures else 'FAILED: ' + ', '.join(failures)}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
