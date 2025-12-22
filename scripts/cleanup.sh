#!/bin/bash

# Colors for logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
RESET='\033[0m'

# Flags
CLEAR_CACHE=false
CLEAR_LOCK=false

# Exit immediately on error
set -e

# Logging functions
log_info() {
  echo -e "${BLUE}$1${RESET}"
}

log_success() {
  echo -e "${GREEN}$1${RESET}"
}

log_warning() {
  echo -e "${YELLOW}$1${RESET}"
}

log_error() {
  echo -e "${RED}$1${RESET}"
}

# Check for any flags passed
check_flags() {
  for arg in "$@"; do
    if [ "$arg" == "--cache" ]; then
      CLEAR_CACHE=true
    fi
     if [ "$arg" == "--lock" ]; then
      CLEAR_LOCK=true
    fi
  done
}

# 📦 Remove node_modules everywhere
remove_node_modules() {
  find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
  log_success "All node_modules removed."
}

# 🗝️ Remove pnpm-lock.yaml
remove_pnpm_lock_file_ifNeeded() {
  if [ "$CLEAR_LOCK" = true ]; then
    if [ -f "pnpm-lock.yaml" ]; then
      log_info "Removing pnpm-lock.yaml..."
      rm -f pnpm-lock.yaml
      log_success "pnpm-lock.yaml removed."
    else
      log_warning "No pnpm-lock.yaml file found to remove."
    fi
  else
    log_warning "Skipping lock file removal."
  fi
}

# 🧹 Clear PNPM Cache
clear_pnpm_cache_ifNeeded() {
  if [ "$CLEAR_CACHE" = true ]; then
    log_info "Clearing PNPM store and cache..."
    pnpm store prune --force
    pnpm cache delete
    log_success "PNPM cache cleared."
  else
    log_warning "Skipping PNPM cache clear"
  fi
}

# 📦 Reinstall dependencies
reinstall_dependencies() {
  pnpm install
  log_success "✨ Dependencies installed!"
}

# Main process
main() {
  log_info "🔧 Starting cleanup..."
  log_info "Tip: Use '-- --cache' to clear PNPM cache during cleanup"
  log_info "Tip: Use '-- --lock' to remove pnpm-lock.yaml"

  check_flags "$@"
  remove_node_modules
  remove_pnpm_lock_file_ifNeeded
  clear_pnpm_cache_ifNeeded
  reinstall_dependencies

  log_success "✨ Cleanup complete!"
}

main "$@"
