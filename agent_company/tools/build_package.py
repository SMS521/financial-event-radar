"""Builds AgentCompany.zip: code + launchers + config + the Anthropic SDK for
Windows/Python 3.12 unpacked into vendor/ (so nothing has to be installed on the PC).

  python tools/build_package.py [--platform win_amd64] [--out AgentCompany.zip]
"""
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {"__pycache__", "python", "data", "reports", "logs", "vendor", "tools"}
SKIP_FILES = {"keys.txt", "STOP_TRADING.txt"}


def vendor(platform, dest):
    with tempfile.TemporaryDirectory() as wh:
        subprocess.check_call([sys.executable, "-m", "pip", "download", "anthropic==1.12.0", "--platform", platform,
                               "--python-version", "3.12", "--only-binary=:all:", "-d", wh, "-q"])
        for f in os.listdir(wh):
            with zipfile.ZipFile(os.path.join(wh, f)) as z:
                z.extractall(dest)


def build(platform="win_amd64", out="AgentCompany.zip"):
    with tempfile.TemporaryDirectory() as tmp:
        v = os.path.join(tmp, "vendor")
        vendor(platform, v)
        with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
            for d, dirs, files in os.walk(ROOT):
                dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
                for f in files:
                    if f in SKIP_FILES or f.endswith((".zip", ".pyc")):
                        continue
                    p = os.path.join(d, f)
                    z.write(p, os.path.join("AgentCompany", os.path.relpath(p, ROOT)))
            for d in ("data", "reports"):
                z.writestr(f"AgentCompany/{d}/.keep", "")
            for dd, _, files in os.walk(v):
                for f in files:
                    p = os.path.join(dd, f)
                    z.write(p, os.path.join("AgentCompany", "vendor", os.path.relpath(p, v)))
    print(out, os.path.getsize(out) // 1024, "KB")


if __name__ == "__main__":
    a = sys.argv[1:]
    build(a[a.index("--platform") + 1] if "--platform" in a else "win_amd64",
          a[a.index("--out") + 1] if "--out" in a else "AgentCompany.zip")
