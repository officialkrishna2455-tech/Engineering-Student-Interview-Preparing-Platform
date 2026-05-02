#!/usr/bin/env bash
# build.sh — Render.com build script for the CareerLaunch backend
# This runs during every deploy.

set -o errexit  # Exit on error

pip install --upgrade pip
pip install -r requirements.txt
