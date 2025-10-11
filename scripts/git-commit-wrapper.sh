#!/usr/bin/env sh

# Check if --no-verify is in arguments
for arg in "$@"; do
  if [ "$arg" = "--no-verify" ] || [ "$arg" = "-n" ]; then
    # Run the warning script
    if [ -f ".husky/no-verify-warning.sh" ]; then
      .husky/no-verify-warning.sh || exit 1
    fi
    break
  fi
done

# Execute the original git commit
exec git commit "$@"
