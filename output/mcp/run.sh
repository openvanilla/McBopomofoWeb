#!/bin/bash

(
    trap 'kill 0' EXIT
    node "$(dirname "$0")/index.js"
)
