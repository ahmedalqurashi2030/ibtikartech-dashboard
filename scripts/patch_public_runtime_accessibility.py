#!/usr/bin/env python3
"""Keep public runtime compatibility patches aligned with shared Django shell."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE_SHELL = ROOT / "static" / "public_preview" / "assets" / "js" / "page-shell.js"

OLD_SKIP_REMOVAL = "    document.querySelector('body.source-home > .skip-link')?.remove();"
NEW_SKIP_GUARD = """    // The Django base owns the canonical skip link. Remove only accidental\n    // duplicate legacy copies after imports; never remove the shared first link.\n    const homepageSkipLinks = [...document.querySelectorAll('body.source-home > .skip-link')];\n    homepageSkipLinks.slice(1).forEach((node) => node.remove());"""


def main() -> None:
    source = PAGE_SHELL.read_text(encoding="utf-8")
    if OLD_SKIP_REMOVAL in source:
        source = source.replace(OLD_SKIP_REMOVAL, NEW_SKIP_GUARD, 1)
        PAGE_SHELL.write_text(source, encoding="utf-8")
    elif "homepageSkipLinks.slice(1)" not in source:
        raise RuntimeError("Homepage skip-link runtime changed; refusing an unsafe patch.")
    print("Public runtime accessibility patch is synchronized.")


if __name__ == "__main__":
    main()
