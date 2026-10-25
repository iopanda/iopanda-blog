#!/usr/bin/env python3
"""Migrate the Obsidian AI notes into numbered Astro content.

The input tree is read-only.  Running this script repeatedly rebuilds
``src/content/ai`` and ``public/ai/images`` from scratch, so the result is
deterministic and safe to re-run.

Usage (from anywhere)::

    python3 scripts/migrate-ai-notes.py

Optional paths can be overridden on the command line; the defaults are
relative to the repository root.
"""

from __future__ import annotations

import argparse
import json
import os
import posixpath
import re
import shutil
import sys
import unicodedata
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Iterable
from urllib.parse import quote

BASE_URL = "/iopanda-blog"
ATTACHMENT_DIR_DEFAULT = "~/Documents/Obsidian/iopanda/01.Attachments"
OBSIDIAN_PREFIX = "03.Engineering/3.10 AI/"

# (source directory, chapter number, chapter slug, chapter title)
CHAPTER_DEFS = [
    ("3.10.1 Models", 1, "models", "Models"),
    ("3.10.2 Agents", 2, "agents", "Agents"),
    ("3.10.3 Frameworks", 3, "frameworks", "Frameworks"),
    ("3.10.4 Tooling", 4, "tooling", "Tooling"),
    ("3.10.5 Trending Projects", 5, "trending-projects", "Trending Projects"),
]

NUM_PREFIX_RE = re.compile(r"^(\d+(?:\.\d+)*)\s+")
H1_RE = re.compile(r"^#\s+")
WIKI_RE = re.compile(r"(!?)\[\[([^\]]+)\]\]")
FRONTMATTER_RE = re.compile(r"^---\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n)?", re.S)
# Old knowledge-base numbering in prose: 3.10.C, 3.10.C.S or 3.10.C.S.T.
# The trailing title is deliberately left untouched.
PROSE_NUMBER_RE = re.compile(r"3\.10\.(\d+)(?:\.(\d+))?(?:\.(\d+))?")


def nfc(value: str) -> str:
    return unicodedata.normalize("NFC", value)


def split_prefix(name: str) -> tuple[tuple[int, ...], str]:
    """Split ``01 Foo`` / ``1.10 Foo`` into its numeric tuple and title."""
    match = NUM_PREFIX_RE.match(name)
    if not match:
        return (), name.strip()
    return tuple(int(part) for part in match.group(1).split(".")), name[match.end() :].strip()


def prefix_key(prefix: tuple[int, ...]) -> tuple[int, tuple[int, ...]]:
    # Directories / files without a numeric prefix sort after numbered ones.
    return (0, prefix) if prefix else (1, ())


def natural_dir_key(name: str) -> tuple[int, tuple[int, ...], str]:
    """Sort key for a section directory (names such as 2026-09 are natural)."""
    match = re.match(r"^(\d+(?:[.\-]\d+)*)", name)
    if not match:
        return 1, (), name
    parts = re.split(r"[.\-]", match.group(1))
    return 0, tuple(int(part) for part in parts), name


def strip_md(value: str) -> str:
    return value[:-3] if value.lower().endswith(".md") else value


def read_text(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    if text.startswith("﻿"):
        text = text[1:]
    return text.replace("\r\n", "\n").replace("\r", "\n")


def split_frontmatter(text: str) -> tuple[str | None, str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return None, text
    return match.group(1), text[match.end() :]


def parse_frontmatter(frontmatter: str | None) -> dict[str, str]:
    values: dict[str, str] = {}
    if not frontmatter:
        return values
    for line in frontmatter.splitlines():
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        values[key.strip()] = value
    return values


@dataclass
class Article:
    source_rel: str  # POSIX path relative to the input root, including .md
    chapter: int
    chapter_slug: str
    chapter_title: str
    section: int
    section_title: str
    group: str
    title: str
    file_key: tuple[int, ...]
    is_readme: bool
    number: str = ""
    out_rel: str = ""
    url: str = ""

    @property
    def source_id(self) -> str:
        """Path relative to the chapter directory, without the .md suffix."""
        rel = self.source_rel.split("/", 1)[1] if "/" in self.source_rel else self.source_rel
        return strip_md(rel)


@dataclass
class SectionPlan:
    chapter: int
    chapter_slug: str
    chapter_title: str
    section: int
    title: str
    directory: str  # POSIX path relative to the input root ("" for chapter root)
    articles: list[Article] = field(default_factory=list)

    @property
    def url(self) -> str:
        return f"{BASE_URL}/ai/{self.chapter:02d}-{self.chapter_slug}/{self.section:02d}/"


@dataclass
class ResolvedLink:
    kind: str  # "article" or "section"
    url: str
    label: str


class Migrator:
    def __init__(self, repo_root: Path, input_root: Path, attachments: Path,
                 content_root: Path, images_root: Path, manifest_path: Path,
                 renumber_prose: bool = True):
        self.repo_root = repo_root
        self.input_root = input_root
        self.attachments = attachments
        self.content_root = content_root
        self.images_root = images_root
        self.manifest_path = manifest_path
        self.renumber_prose = renumber_prose

        self.sections: list[SectionPlan] = []
        self.articles: list[Article] = []
        self.file_index: dict[str, Article] = {}
        self.files_by_basename: dict[str, list[Article]] = {}
        self.files_by_norm_basename: dict[str, list[Article]] = {}
        self.dir_index: dict[str, SectionPlan] = {}
        self.dirs_by_basename: dict[str, list[tuple[str, SectionPlan]]] = {}

        self.unresolved: list[dict[str, str]] = []
        self.image_names: set[str] = set()
        self.missing_images: list[tuple[str, str]] = []
        self.missing_attachments: list[str] = []
        self.escaped_bracket_fixes = 0
        self.link_count = 0
        self.resolved_count = 0
        self.image_count = 0
        self.prose_replacements = 0
        self.prose_files: set[str] = set()

    # ------------------------------------------------------------------
    # Planning: source tree -> numbered articles
    # ------------------------------------------------------------------
    def plan(self) -> None:
        for dirname, chapter, slug, title in CHAPTER_DEFS:
            chapter_dir = self.input_root / dirname
            if not chapter_dir.is_dir():
                raise SystemExit(f"missing chapter directory: {chapter_dir}")

            # Chapter-root files form section 00.
            root_files = sorted(
                (p for p in chapter_dir.iterdir() if p.is_file() and p.suffix.lower() == ".md"),
                key=lambda p: natural_dir_key(p.name),
            )
            if root_files:
                section = SectionPlan(
                    chapter=chapter,
                    chapter_slug=slug,
                    chapter_title=title,
                    section=0,
                    title="章导览",
                    directory=dirname,
                )
                for path in root_files:
                    section.articles.append(self._make_article(path, section, is_chapter_root=True))
                self._finalise_section(section)

            section_dirs = []
            for path in chapter_dir.iterdir():
                if not path.is_dir():
                    continue
                if any(p.is_file() and p.suffix.lower() == ".md" for p in path.rglob("*")):
                    section_dirs.append(path)
            section_dirs.sort(key=lambda p: natural_dir_key(p.name))

            for index, section_dir in enumerate(section_dirs, start=1):
                section = SectionPlan(
                    chapter=chapter,
                    chapter_slug=slug,
                    chapter_title=title,
                    section=index,
                    title=split_prefix(section_dir.name)[1],
                    directory=f"{dirname}/{section_dir.name}",
                )
                for path in sorted(section_dir.rglob("*")):
                    if path.is_file() and path.suffix.lower() == ".md":
                        section.articles.append(self._make_article(path, section))
                self._finalise_section(section)

        # Indexes used by the wiki-link resolver.
        for article in self.articles:
            key = nfc(strip_md(article.source_rel))
            self.file_index[key] = article
            basename = nfc(posixpath.basename(key))
            self.files_by_basename.setdefault(basename, []).append(article)
            self.files_by_norm_basename.setdefault(basename.replace("/", "-"), []).append(article)

        for section in self.sections:
            self.dir_index[nfc(section.directory)] = section
            self.dirs_by_basename.setdefault(nfc(posixpath.basename(section.directory)), []).append(
                (nfc(section.directory), section)
            )
            # Every deeper directory belongs to its section.
            section_path = self.input_root / section.directory
            for path in section_path.rglob("*"):
                if path.is_dir():
                    rel = nfc(path.relative_to(self.input_root).as_posix())
                    self.dir_index[rel] = section
                    self.dirs_by_basename.setdefault(nfc(path.name), []).append((rel, section))

    def _make_article(self, path: Path, section: SectionPlan, is_chapter_root: bool = False) -> Article:
        source_rel = path.relative_to(self.input_root).as_posix()
        section_rel = path.relative_to(self.input_root / section.directory).as_posix()
        parts = section_rel.split("/")

        if len(parts) == 1:
            group = ""
            combined = strip_md(parts[0])
        else:
            group = parts[0]
            combined = strip_md("/".join(parts[1:]))

        is_readme = posixpath.basename(combined).lower() == "readme" and len(parts) <= 2
        if is_readme:
            topic = group if group else (section.title if not is_chapter_root else "章导览")
            file_key, title = (), split_prefix(topic)[1]
        else:
            file_key, title = split_prefix(combined)

        return Article(
            source_rel=source_rel,
            chapter=section.chapter,
            chapter_slug=section.chapter_slug,
            chapter_title=section.chapter_title,
            section=section.section,
            section_title=section.title,
            group=group,
            title=title,
            file_key=file_key,
            is_readme=is_readme,
        )

    def _finalise_section(self, section: SectionPlan) -> None:
        root_articles = [a for a in section.articles if a.group == ""]
        group_names = sorted({a.group for a in section.articles if a.group})
        groups = {
            name: [a for a in section.articles if a.group == name]
            for name in group_names
        }
        group_names.sort(key=lambda name: (prefix_key(split_prefix(name)[0]), name))

        ordered: list[Article] = []
        ordered.extend(sorted(root_articles, key=self._article_sort_key))
        for name in group_names:
            ordered.extend(sorted(groups[name], key=self._article_sort_key))

        for index, article in enumerate(ordered, start=1):
            article.number = f"{article.chapter:02d}.{article.section:02d}.{index:02d}"
            filename = f"{index:02d} {sanitise_filename(article.title)}.md"
            article.out_rel = (
                f"src/content/ai/{article.chapter:02d}-{article.chapter_slug}/"
                f"{article.section:02d}/{filename}"
            )
            article.url = (
                f"{BASE_URL}/ai/{article.chapter:02d}-{article.chapter_slug}/"
                f"{article.section:02d}/{index:02d}/"
            )

        section.articles = ordered
        self.sections.append(section)
        self.articles.extend(ordered)

    @staticmethod
    def _article_sort_key(article: Article) -> tuple:
        # A README is the main article of its directory and always comes first.
        return (0 if article.is_readme else 1, prefix_key(article.file_key), nfc(article.source_rel))

    # ------------------------------------------------------------------
    # Wiki link / image resolution
    # ------------------------------------------------------------------
    def normalise_target(self, raw: str) -> str:
        target = nfc(raw.strip())
        if target.startswith(OBSIDIAN_PREFIX):
            target = target[len(OBSIDIAN_PREFIX) :]
        while target.startswith("./"):
            target = target[2:]
        target = target.rstrip("/")
        return strip_md(target)

    def resolve(self, target: str, current: Article) -> ResolvedLink | None:
        if not target:
            return None

        if target in self.file_index:
            return self._article_link(self.file_index[target])
        if target in self.dir_index:
            return self._section_link(self.dir_index[target])

        # Links written relative to the current file's directory.
        if target.startswith("../") or target.startswith("./"):
            relative = posixpath.normpath(posixpath.join(posixpath.dirname(current.source_rel), target))
            relative = nfc(relative)
            if relative in self.file_index:
                return self._article_link(self.file_index[relative])
            if relative in self.dir_index:
                return self._section_link(self.dir_index[relative])

        # A path suffix, e.g. "3.10.2.9 Agent Implementations/00 Learning Path"
        # (the chapter directory is omitted in a few links).
        nested_files = [
            article
            for key, article in self.file_index.items()
            if key == target or key.endswith("/" + target)
        ]
        selected = self._narrow(nested_files, current)
        if selected is not None:
            return self._article_link(selected)

        nested_dirs = [
            (key, section)
            for key, section in self.dir_index.items()
            if key == target or key.endswith("/" + target)
        ]
        selected_dir = self._narrow_dirs(nested_dirs, current)
        if selected_dir is not None:
            return self._section_link(selected_dir)

        # Last resort: a unique file name.
        basename = posixpath.basename(target)
        selected = self._narrow(self.files_by_basename.get(basename, []), current)
        if selected is not None:
            return self._article_link(selected)

        # Obsidian links sometimes spell a slash-split file name with "/",
        # while the note itself uses "-" on disk (e.g. "CI/CD" vs "CI-CD").
        normalised_basename = basename.replace("/", "-")
        selected = self._narrow(self.files_by_norm_basename.get(normalised_basename, []), current)
        if selected is not None:
            return self._article_link(selected)

        # Some targets spell punctuation differently from the file on disk
        # ("CI/CD" vs "CI-CD", "单卡/小团队" vs "单卡或小团队").  When the
        # target names an existing directory plus a numeric file prefix, that
        # pair uniquely identifies the note; use it rather than guessing by
        # fuzzy title similarity.
        selected = self._resolve_by_directory_and_number(target)
        if selected is not None:
            return self._article_link(selected)

        # Bare directory link: point at the section index page.
        candidates = self.dirs_by_basename.get(basename, [])
        selected_dir = self._narrow_dirs(candidates, current)
        if selected_dir is not None:
            return self._section_link(selected_dir)

        return None

    def _resolve_by_directory_and_number(self, target: str) -> Article | None:
        if "/" not in target:
            return None
        best_directory = ""
        for directory in self.dir_index:
            if target.startswith(directory + "/") and len(directory) > len(best_directory):
                best_directory = directory
        if not best_directory:
            return None

        remainder = target[len(best_directory) + 1 :]
        prefix, _ = split_prefix(remainder)
        if not prefix:
            return None

        candidates = [
            article
            for article in self.file_index.values()
            if posixpath.dirname(article.source_rel) == best_directory
            and article.file_key == prefix
        ]
        unique = {article.source_rel: article for article in candidates}
        if len(unique) == 1:
            return next(iter(unique.values()))
        return None

    def _narrow(self, candidates: list[Article], current: Article) -> Article | None:
        if not candidates:
            return None
        if len(candidates) == 1:
            return candidates[0]

        scopes = [
            lambda a: posixpath.dirname(a.source_rel) == posixpath.dirname(current.source_rel),
            lambda a: (a.chapter, a.section, a.group)
            == (current.chapter, current.section, current.group),
            lambda a: (a.chapter, a.section) == (current.chapter, current.section),
            lambda a: a.chapter == current.chapter,
        ]
        for in_scope in scopes:
            scoped = [candidate for candidate in candidates if in_scope(candidate)]
            if len(scoped) == 1:
                return scoped[0]
            if len(scoped) > 1:
                return None
        return None

    def _narrow_dirs(
        self,
        candidates: list[tuple[str, SectionPlan]],
        current: Article,
    ) -> SectionPlan | None:
        if not candidates:
            return None
        unique = {section.directory: section for _, section in candidates}
        if len(unique) == 1:
            return next(iter(unique.values()))

        chapter_dirs = [
            section for section in unique.values() if section.chapter == current.chapter
        ]
        if len(chapter_dirs) == 1:
            return chapter_dirs[0]
        return None

    def _article_link(self, article: Article) -> ResolvedLink:
        return ResolvedLink("article", article.url, article.title)

    def _section_link(self, section: SectionPlan) -> ResolvedLink:
        return ResolvedLink("section", section.url, section.title)

    # ------------------------------------------------------------------
    # Rendering
    # ------------------------------------------------------------------
    def render_body(self, source_rel: str, body: str, current: Article) -> str:
        def replace(match: re.Match[str]) -> str:
            is_embed, inner = match.group(1) == "!", match.group(2)
            if is_embed:
                name = inner.split("|", 1)[0].strip()
                self.image_names.add(name)
                self.image_count += 1
                url_name = quote(name, safe="")
                return f"![]({BASE_URL}/ai/images/{url_name})"

            self.link_count += 1
            target_part, separator, alias = inner.partition("|")
            target = self.normalise_target(target_part)
            resolved = self.resolve(target, current)
            if resolved is None:
                self._record_unresolved(source_rel, match.group(0))
                # A few "links" are not note references at all (for example
                # TOML ``[[mcp_servers.<name>]]`` inside an inline code span).
                # Keep their visible text, but drop the wiki syntax so the
                # output has no residual ``[[``.
                return alias.strip() if separator and alias.strip() else target_part.strip()

            self.resolved_count += 1
            label = alias.strip() if separator and alias.strip() else resolved.label
            return f"[{escape_link_text(label)}]({resolved.url})"

        body = WIKI_RE.sub(replace, body)
        # Three notes contain the Python regex ``\[["']`` inside a fenced
        # code block.  It is not a wiki link, but it leaves a literal ``[[``
        # in the output.  ``\[(?:["']`` matches exactly the same text, so the
        # tutorial code stays valid while the output contains no ``[[``.
        before = body.count("\\[[")
        if before:
            body = body.replace("\\[[", "\\[(?:[")
            self.escaped_bracket_fixes += before
        body = body.lstrip("\n")
        lines = body.split("\n")
        for index, line in enumerate(lines):
            if not line.strip():
                continue
            if H1_RE.match(line):
                lines[index] = f"# {current.title}"
            break
        body = "\n".join(lines).rstrip() + "\n"
        # Renumber after link resolution and H1 normalisation, so the count
        # reflects what actually remains in the written article.
        if self.renumber_prose:
            body = self._renumber_prose(source_rel, body)
        return body

    def _renumber_prose(self, source_rel: str, body: str) -> str:
        """Rewrite old ``3.10.C[.S[.T]]`` prefixes in the article body.

        ``3.10.C`` becomes ``0C``, ``3.10.C.S`` becomes ``0C.0S`` and the
        four-level form loses its last component (sub-directories became
        groups).  Only the numeric prefix is replaced; the title that follows
        it is preserved verbatim.
        """

        def replace(match: re.Match[str]) -> str:
            chapter = int(match.group(1))
            section = match.group(2)
            if section is None:
                return f"{chapter:02d}"
            return f"{chapter:02d}.{int(section):02d}"

        body, count = PROSE_NUMBER_RE.subn(replace, body)
        if count:
            self.prose_replacements += count
            self.prose_files.add(source_rel)
        return body

    def _record_unresolved(self, source_rel: str, raw: str) -> None:
        self.unresolved.append({"source": source_rel, "link": raw})

    def render_article(self, article: Article, text: str) -> str:
        frontmatter, body = split_frontmatter(text)
        values = parse_frontmatter(frontmatter)
        source_path = self.input_root / article.source_rel

        created = values.get("created_at") or datetime.fromtimestamp(
            source_path.stat().st_mtime
        ).strftime("%Y-%m-%d %H:%M")
        tags = [tag.strip() for tag in values.get("tags", "").split(",") if tag.strip()]
        author = values.get("author") or "iopanda"

        rendered_body = self.render_body(article.source_rel, body, article)
        lines = [
            "---",
            f"title: {yaml_scalar(article.title)}",
            f"number: {yaml_scalar(article.number)}",
            f"chapter: {article.chapter}",
            f"chapterTitle: {yaml_scalar(article.chapter_title)}",
            f"section: {article.section}",
            f"sectionTitle: {yaml_scalar(article.section_title)}",
            f"group: {yaml_scalar(article.group)}",
            f"created: {created}",
            f"author: {yaml_scalar(author)}",
            f"tags: {json.dumps(tags, ensure_ascii=False)}",
            f"sourceId: {yaml_scalar(article.source_id)}",
            "---",
            "",
        ]
        return "\n".join(lines) + rendered_body

    # ------------------------------------------------------------------
    # Writing / verification
    # ------------------------------------------------------------------
    def write(self) -> None:
        if self.content_root.exists():
            shutil.rmtree(self.content_root)
        if self.images_root.exists():
            shutil.rmtree(self.images_root)
        self.content_root.mkdir(parents=True, exist_ok=True)
        self.images_root.mkdir(parents=True, exist_ok=True)

        for article in self.articles:
            source = self.input_root / article.source_rel
            destination = self.repo_root / article.out_rel
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(self.render_article(article, read_text(source)), encoding="utf-8")

        for name in sorted(self.image_names):
            source = self.attachments / name
            if not source.is_file():
                self.missing_attachments.append(name)
                continue
            shutil.copy2(source, self.images_root / name)

        self._write_manifest()

    def _write_manifest(self) -> None:
        chapters = []
        for _, chapter_no, slug, title in CHAPTER_DEFS:
            sections = [s for s in self.sections if s.chapter == chapter_no]
            chapters.append(
                {
                    "chapter": chapter_no,
                    "number": f"{chapter_no:02d}",
                    "slug": slug,
                    "title": title,
                    "articleCount": sum(len(s.articles) for s in sections),
                    "sectionCount": len(sections),
                    "sections": [
                        {
                            "section": section.section,
                            "number": f"{section.section:02d}",
                            "title": section.title,
                            "url": section.url,
                            "articleCount": len(section.articles),
                            "articles": [
                                {
                                    "number": article.number,
                                    "title": article.title,
                                    "group": article.group,
                                    "path": article.out_rel,
                                    "url": article.url,
                                    "sourceId": article.source_id,
                                }
                                for article in section.articles
                            ],
                        }
                        for section in sections
                    ],
                }
            )

        manifest = {
            "source": "import/ai-notes",
            "baseUrl": BASE_URL,
            "totalArticles": len(self.articles),
            "totalSections": len(self.sections),
            "chapters": chapters,
            "images": [
                {
                    "name": name,
                    "path": f"public/ai/images/{name}",
                    "url": f"{BASE_URL}/ai/images/{quote(name, safe='')}",
                }
                for name in sorted(self.image_names)
                if name not in self.missing_attachments
            ],
            "unresolvedLinks": self.unresolved,
        }
        self.manifest_path.parent.mkdir(parents=True, exist_ok=True)
        self.manifest_path.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    def report(self) -> None:
        print(f"articles: {len(self.articles)}")
        for _, chapter_no, _, title in CHAPTER_DEFS:
            sections = [s for s in self.sections if s.chapter == chapter_no]
            count = sum(len(s.articles) for s in sections)
            print(f"  {chapter_no:02d} {title}: {count} articles, {len(sections)} sections")
        print(f"images copied: {len(self.image_names) - len(self.missing_attachments)}")
        print(f"wiki links: {self.link_count} ({self.resolved_count} resolved)")
        print(f"escaped-regex bracket fixes: {self.escaped_bracket_fixes}")
        if self.renumber_prose:
            print(
                f"prose renumbering: {self.prose_replacements} replacements "
                f"in {len(self.prose_files)} files"
            )
        else:
            print("prose renumbering: disabled")
        print(f"unresolved wiki links: {len(self.unresolved)}")
        for item in self.unresolved:
            print(f"  {item['source']}: {item['link']}")
        if self.missing_attachments:
            print("missing attachments:", file=sys.stderr)
            for name in self.missing_attachments:
                print(f"  {name}", file=sys.stderr)


def sanitise_filename(title: str) -> str:
    """Keep titles readable while avoiding path separators."""
    return title.replace("/", "／").replace("\\", "＼").replace("\x00", "").strip()


def yaml_scalar(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def escape_link_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("[", "\\[").replace("]", "\\]")


def parse_args() -> argparse.Namespace:
    repo_root = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=repo_root / "import/ai-notes")
    parser.add_argument("--attachments", type=Path, default=Path(os.path.expanduser(ATTACHMENT_DIR_DEFAULT)))
    parser.add_argument("--content", type=Path, default=repo_root / "src/content/ai")
    parser.add_argument("--images", type=Path, default=repo_root / "public/ai/images")
    parser.add_argument("--manifest", type=Path, default=repo_root / "src/data/ai-manifest.json")
    parser.add_argument(
        "--renumber-prose",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="rewrite old 3.10.C[.S[.T]] numbers in article bodies (default: on)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo_root = Path(__file__).resolve().parent.parent
    migrator = Migrator(
        repo_root=repo_root,
        input_root=args.input.resolve(),
        attachments=args.attachments.resolve(),
        content_root=args.content.resolve(),
        images_root=args.images.resolve(),
        manifest_path=args.manifest.resolve(),
        renumber_prose=args.renumber_prose,
    )
    migrator.plan()
    migrator.write()
    migrator.report()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
