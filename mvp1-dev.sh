#!/usr/bin/env bash

# 🚀 Terpologie MVP1 - Git & Development Helper
# Usage: ./mvp1-dev.sh <command> [args]

set -e

MAIN_BRANCH="main"
DEV_BRANCH="dev/integrate-latest"
FEATURES=(
  "feat/backend-normalize-account-types"
  "feat/backend-centralize-permissions"
  "feat/frontend-restructure-accountpage"
  "feat/frontend-create-librarypage"
  "feat/fiche-technique-sections-complete"
  "feat/pipeline-culture"
  "feat/genealogy-tree"
  "feat/pipeline-curing"
  "feat/export-maker-templates"
  "feat/export-formats"
  "feat/gallery-public-complete"
  "fix/admin-panel-security"
  "feat/payment-integration"
  "feat/permissions-sync"
  "test/e2e-all-tiers"
)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Commands
case "$1" in
  start-feature)
    if [ -z "$2" ]; then
      print_error "Usage: mvp1-dev.sh start-feature <feature-number>"
      echo "Available features:"
      for i in "${!FEATURES[@]}"; do
        echo "  $((i+1)). ${FEATURES[$i]}"
      done
      exit 1
    fi
    
    FEATURE_NUM=$2
    FEATURE_BRANCH="${FEATURES[$((FEATURE_NUM-1))]}"
    
    if [ -z "$FEATURE_BRANCH" ]; then
      print_error "Invalid feature number: $FEATURE_NUM"
      exit 1
    fi
    
    print_header "Starting Feature $FEATURE_NUM: $FEATURE_BRANCH"
    git checkout $DEV_BRANCH
    git pull origin $DEV_BRANCH
    git checkout -b $FEATURE_BRANCH
    print_success "Feature branch created and checked out"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo "1. Implement feature (check PHASE1_CHECKLIST.md for tasks)"
    echo "2. Commit: git add . && git commit -m \"feat(...): description\""
    echo "3. Push: git push -u origin $FEATURE_BRANCH"
    echo "4. Create Pull Request on GitHub"
    ;;

  status)
    print_header "Current Status"
    git status
    echo -e "\n${YELLOW}Current Branch:${NC}"
    git branch --show-current
    echo -e "\n${YELLOW}Recent Commits:${NC}"
    git log --oneline -5
    ;;

  sync)
    print_header "Syncing with Remote"
    CURRENT_BRANCH=$(git branch --show-current)
    print_warning "Syncing: $CURRENT_BRANCH"
    git fetch origin
    git pull origin $CURRENT_BRANCH
    print_success "Synced with remote"
    ;;

  commit)
    if [ -z "$2" ]; then
      print_error "Usage: mvp1-dev.sh commit \"<message>\""
      exit 1
    fi
    
    print_header "Committing Changes"
    git add .
    git commit -m "$2"
    print_success "Changes committed"
    ;;

  push)
    CURRENT_BRANCH=$(git branch --show-current)
    print_header "Pushing to Remote"
    git push -u origin $CURRENT_BRANCH
    print_success "Pushed to: origin/$CURRENT_BRANCH"
    echo -e "${YELLOW}Create PR at: https://github.com/RAFOUgg/Reviews-Maker/pulls${NC}"
    ;;

  reset)
    print_warning "Resetting to $DEV_BRANCH (removes local changes)"
    read -p "Continue? (y/N): " confirm
    if [ "$confirm" = "y" ]; then
      git checkout $DEV_BRANCH
      git reset --hard origin/$DEV_BRANCH
      print_success "Reset complete"
    fi
    ;;

  list-features)
    print_header "All Features (15 total)"
    for i in "${!FEATURES[@]}"; do
      echo "  $((i+1)). ${FEATURES[$i]}"
    done
    ;;

  help)
    echo -e "${BLUE}Terpologie MVP1 Git Helper${NC}"
    echo ""
    echo "Usage: ./mvp1-dev.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  start-feature <num>   - Start a new feature branch"
    echo "  status                - Show current status"
    echo "  sync                  - Sync with remote"
    echo "  commit \"<msg>\"       - Stage & commit all changes"
    echo "  push                  - Push current branch"
    echo "  reset                 - Reset to dev branch"
    echo "  list-features         - List all 15 features"
    echo "  help                  - Show this help"
    echo ""
    echo "Example workflow:"
    echo "  ./mvp1-dev.sh start-feature 1"
    echo "  ./mvp1-dev.sh commit \"feat: Normalize account types\""
    echo "  ./mvp1-dev.sh push"
    ;;

  *)
    print_error "Unknown command: $1"
    echo "Use './mvp1-dev.sh help' for usage"
    exit 1
    ;;
esac
