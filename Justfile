#!/usr/bin/env -S just --justfile

nuke:
  rm -rf node_modules packages/*/node_modules
