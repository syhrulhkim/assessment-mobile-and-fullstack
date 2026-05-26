#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

find_docker_cmd() {
  if command -v docker >/dev/null 2>&1; then
    echo "docker"
    return
  fi

  local mac_docker="/Applications/Docker.app/Contents/Resources/bin/docker"
  if [[ -x "$mac_docker" ]]; then
    echo "$mac_docker"
    return
  fi

  echo ""
}

DOCKER_CMD="$(find_docker_cmd)"

if [[ -z "$DOCKER_CMD" ]]; then
  echo "Error: Docker CLI not found."
  echo "Install Docker Desktop, then re-run:"
  echo "  ./run.sh"
  echo
  echo "macOS install guide: https://docs.docker.com/desktop/setup/install/mac-install/"
  exit 1
fi

if ! "$DOCKER_CMD" compose version >/dev/null 2>&1; then
  echo "Error: Docker Compose plugin is not available."
  echo "Open Docker Desktop and wait until it is fully started, then run:"
  echo "  ./run.sh"
  exit 1
fi

copy_if_missing() {
  local source_file="$1"
  local target_file="$2"
  if [[ ! -f "$target_file" && -f "$source_file" ]]; then
    cp "$source_file" "$target_file"
    echo "Created $target_file from $source_file"
  fi
}

copy_if_missing "backend/laravel-api/.env.example" "backend/laravel-api/.env"
copy_if_missing "frontend/nextjs-app/.env.example" "frontend/nextjs-app/.env.local"
copy_if_missing "mobile/react-native-app/.env.example" "mobile/react-native-app/.env"

echo "Starting MySQL + Backend + Frontend..."
"$DOCKER_CMD" compose up --build
