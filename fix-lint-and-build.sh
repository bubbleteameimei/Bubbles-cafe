
#!/usr/bin/env bash
set -euo pipefail

echo "==> Ensuring package.json exists"
if [ ! -f package.json ]; then
  echo "package.json not found. Run this from your project root." >&2
  exit 1
fi

echo "==> Detecting package manager"
PM="npm"
if command -v pnpm >/dev/null 2>&1 && [ -f pnpm-lock.yaml ]; then PM="pnpm"; fi
if command -v yarn >/dev/null 2>&1 && [ -f yarn.lock ]; then PM="yarn"; fi
echo "   Using: $PM"

install_deps() {
  case "$PM" in
    pnpm) pnpm install --frozen-lockfile || pnpm install ;;
    yarn) yarn install --frozen-lockfile || yarn install ;;
    *) npm ci || npm install ;;
  esac
}

add_dev_deps() {
  if [ $# -eq 0 ]; then return 0; fi
  case "$PM" in
    pnpm) pnpm add -D "$@" ;;
    yarn) yarn add -D "$@" ;;
    *) npm install -D "$@" ;;
  esac
}

has_dep() {
  node -e "try{const p=require('./package.json');const d={...p.dependencies,...p.devDependencies};process.exit(d && d['$1']?0:1)}catch(e){process.exit(1)}"
}

has_script() {
  node -e "try{const p=require('./package.json');process.exit(p.scripts && p.scripts['$1']?0:1)}catch(e){process.exit(1)}"
}

echo "==> Installing existing dependencies"
install_deps

echo "==> Detecting project characteristics"
IS_TS="no"
if [ -f tsconfig.json ] || find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -print -quit | grep -q .; then IS_TS="yes"; fi
IS_REACT="no"; has_dep react && IS_REACT="yes"
IS_NEXT="no";  has_dep next && IS_NEXT="yes"
IS_VITE="no";  has_dep vite && IS_VITE="yes"
IS_CRA="no";   has_dep react-scripts && IS_CRA="yes"
echo "   TypeScript: $IS_TS, React: $IS_REACT, Next: $IS_NEXT, Vite: $IS_VITE, CRA: $IS_CRA"

echo "==> Adding ESLint and related tools"
DEPS=(eslint eslint-config-prettier eslint-plugin-import eslint-plugin-unused-imports)
[ "$IS_REACT" = "yes" ] && DEPS+=("eslint-plugin-react" "eslint-plugin-react-hooks" "eslint-plugin-jsx-a11y")
[ "$IS_TS" = "yes" ] && DEPS+=("typescript" "@typescript-eslint/parser" "@typescript-eslint/eslint-plugin")
[ "$IS_NEXT" = "yes" ] && DEPS+=("eslint-config-next")
add_dev_deps "${DEPS[@]}"

echo "==> Writing .eslintignore (if missing)"
if [ ! -f .eslintignore ]; then
cat > .eslintignore <<'EIG'
node_modules
.next
out
dist
build
coverage
storybook-static
**/*.min.js
EIG
fi

echo "==> Writing tsconfig.json (if TS and missing)"
if [ "$IS_TS" = "yes" ] && [ ! -f tsconfig.json ]; then
cat > tsconfig.json <<'ETSC'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true
  },
  "include": ["src", "app", "pages", "components", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist", "build", ".next"]
}
ETSC
fi

echo "==> Writing ESLint config (if missing)"
if [ ! -f .eslintrc.cjs ] && [ ! -f .eslintrc.js ] && [ ! -f .eslintrc.json ] && [ ! -f .eslintrc.yml ] && [ ! -f .eslintrc.yaml ]; then
  if [ "$IS_NEXT" = "yes" ]; then
cat > .eslintrc.cjs <<'ENEXT'
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'jsx-a11y', 'react', 'react-hooks', 'import', 'unused-imports'],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'import/order': ['error', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
  }
};
ENEXT
  else
cat > .eslintrc.cjs <<'EBASE'
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { es2022: true, node: true, browser: true },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['import', 'unused-imports'],
  rules: {
    'import/order': ['error', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended'],
      plugins: ['@typescript-eslint'],
      rules: { '@typescript-eslint/no-non-null-assertion': 'off' }
    },
    {
      files: ['**/*.{jsx,tsx}'],
      plugins: ['react', 'react-hooks'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
      settings: { react: { version: 'detect' } },
      rules: { 'react/react-in-jsx-scope': 'off', 'react/prop-types': 'off' }
    }
  ]
};
EBASE
  fi
fi

echo "==> Reinstalling to ensure new devDeps available"
install_deps

echo "==> Running ESLint with auto-fix and zero warnings"
npx --yes eslint . --ext .js,.jsx,.ts,.tsx --fix --max-warnings=0

if [ "$IS_TS" = "yes" ]; then
  echo "==> Type checking (no emit)"
  npx --yes tsc --noEmit
fi

echo "==> Building"
if [ "$IS_NEXT" = "yes" ]; then
  npx --yes next build
elif [ "$IS_VITE" = "yes" ]; then
  npx --yes vite build
elif [ "$IS_CRA" = "yes" ]; then
  if has_script build; then
    case "$PM" in
      pnpm) pnpm run -s build ;;
      yarn) yarn build ;;
      *) npm run -s build ;;
    esac
  else
    npx --yes react-scripts build
  fi
elif has_script build; then
  case "$PM" in
    pnpm) pnpm run -s build ;;
    yarn) yarn build ;;
    *) npm run -s build ;;
  esac
else
  echo "No build script detected; skipping build."
fi

echo "==> Done. Lint fixed and build completed."
