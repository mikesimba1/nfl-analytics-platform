#!/usr/bin/env python3
"""
Test runner that ensures the project 'src' directory is on sys.path and then
invokes pytest with the provided arguments (or defaults to all tests).
"""

import sys
from pathlib import Path

def main(argv=None) -> int:
    argv = list(argv or sys.argv[1:])

    project_root = Path(__file__).resolve().parent.parent
    src_path = project_root / "src"
    sys.path.insert(0, str(src_path))

    try:
        import pytest  # type: ignore
    except Exception as exc:
        print(f"Failed to import pytest: {exc}")
        return 2

    if not argv:
        argv = ["-q", "tests"]

    return pytest.main(argv)

if __name__ == "__main__":
    raise SystemExit(main())


