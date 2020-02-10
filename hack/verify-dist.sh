#!/usr/bin/env bash

set -e -o pipefail; [[ -n "$DEBUG" ]] && set -x

SCRIPT_ROOT="$(cd $(dirname $0); pwd)"

out_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$out_dir"
}
trap "cleanup" EXIT SIGINT

npm run build -- --out "${out_dir}"
ret=0
diff <(cat "${SCRIPT_ROOT}/../dist/index.js" | grep -v "^module.exports = {") <(cat "${out_dir}/index.js" | grep -v "^module.exports = {") || ret=$?

if [[ $ret -eq 0 ]]; then
  echo "dist/index.js is up to date."
else
  echo "dist/index.js is out of date. Please run 'npm run build'."
  exit 1
fi
# vim: ai ts=2 sw=2 et sts=2 ft=sh
