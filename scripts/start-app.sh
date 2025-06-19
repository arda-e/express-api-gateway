#!/bin/sh
set -e
tsx -r tsconfig-paths/register --watch --inspect=0.0.0.0:9229 src/index.ts