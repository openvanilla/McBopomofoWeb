#!/bin/bash
set -e

echo "🧹 Cleaning build artifacts..."
npm run clean

echo "🔍 Running type check..."
npm run type-check

echo "🎨 Checking code formatting..."
npm run format:check

echo "📝 Running linter..."
npm run lint

echo "🧪 Running tests..."
npm run test:coverage

echo "🏗️  Building all targets..."
npm run build
npm run build:chromeos
npm run build:pime

echo "✅ All checks passed!"
