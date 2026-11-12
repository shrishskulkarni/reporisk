/**
 * Framework & Technology Discovery Engine
 * Inspects package manifests, configuration files, and CI workflows statically.
 *
 * Epistemic Classification: FACT
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DetectedFramework } from '../types/topology.js';

interface FrameworkSignature {
  readonly name: string;
  readonly category: DetectedFramework['category'];
  readonly manifestName: string;
  readonly check: (content: string) => boolean;
}

const FRAMEWORK_SIGNATURES: readonly FrameworkSignature[] = [
  // Web Frameworks (Node.js)
  {
    name: 'Express.js',
    category: 'WEB_FRAMEWORK',
    manifestName: 'package.json',
    check: (c) => /"express"\s*:/i.test(c)
  },
  {
    name: 'Fastify',
    category: 'WEB_FRAMEWORK',
    manifestName: 'package.json',
    check: (c) => /"fastify"\s*:/i.test(c)
  },
  {
    name: 'NestJS',
    category: 'WEB_FRAMEWORK',
    manifestName: 'package.json',
    check: (c) => /"@nestjs\/core"\s*:/i.test(c)
  },
  {
    name: 'Next.js',
    category: 'WEB_FRAMEWORK',
    manifestName: 'package.json',
    check: (c) => /"next"\s*:/i.test(c)
  },
  {
    name: 'Koa',
    category: 'WEB_FRAMEWORK',
    manifestName: 'package.json',
    check: (c) => /"koa"\s*:/i.test(c)
  },
  // ORMs & Databases (Node.js)
  {
    name: 'Prisma',
    category: 'ORM',
    manifestName: 'package.json',
    check: (c) => /"@prisma\/client"|"prisma"\s*:/i.test(c)
  },
  {
    name: 'TypeORM',
    category: 'ORM',
    manifestName: 'package.json',
    check: (c) => /"typeorm"\s*:/i.test(c)
  },
  {
    name: 'Mongoose',
    category: 'ORM',
    manifestName: 'package.json',
    check: (c) => /"mongoose"\s*:/i.test(c)
  },
  // Test Runners (Node.js)
  {
    name: 'Vitest',
    category: 'TEST_RUNNER',
    manifestName: 'package.json',
    check: (c) => /"vitest"\s*:/i.test(c)
  },
  {
    name: 'Jest',
    category: 'TEST_RUNNER',
    manifestName: 'package.json',
    check: (c) => /"jest"\s*:/i.test(c)
  },
  // Python Frameworks
  {
    name: 'FastAPI',
    category: 'WEB_FRAMEWORK',
    manifestName: 'requirements.txt',
    check: (c) => /^fastapi\b/im.test(c)
  },
  {
    name: 'Flask',
    category: 'WEB_FRAMEWORK',
    manifestName: 'requirements.txt',
    check: (c) => /^flask\b/im.test(c)
  },
  {
    name: 'Django',
    category: 'WEB_FRAMEWORK',
    manifestName: 'requirements.txt',
    check: (c) => /^django\b/im.test(c)
  },
  {
    name: 'SQLAlchemy',
    category: 'ORM',
    manifestName: 'requirements.txt',
    check: (c) => /^sqlalchemy\b/im.test(c)
  },
  {
    name: 'Pytest',
    category: 'TEST_RUNNER',
    manifestName: 'requirements.txt',
    check: (c) => /^pytest\b/im.test(c)
  },
  // Python pyproject.toml
  {
    name: 'FastAPI',
    category: 'WEB_FRAMEWORK',
    manifestName: 'pyproject.toml',
    check: (c) => /fastapi/i.test(c)
  },
  {
    name: 'Django',
    category: 'WEB_FRAMEWORK',
    manifestName: 'pyproject.toml',
    check: (c) => /django/i.test(c)
  },
  {
    name: 'Flask',
    category: 'WEB_FRAMEWORK',
    manifestName: 'pyproject.toml',
    check: (c) => /flask/i.test(c)
  },
  // Go Frameworks
  {
    name: 'Gin',
    category: 'WEB_FRAMEWORK',
    manifestName: 'go.mod',
    check: (c) => /github\.com\/gin-gonic\/gin/i.test(c)
  },
  {
    name: 'Echo',
    category: 'WEB_FRAMEWORK',
    manifestName: 'go.mod',
    check: (c) => /github\.com\/labstack\/echo/i.test(c)
  },
  {
    name: 'Fiber',
    category: 'WEB_FRAMEWORK',
    manifestName: 'go.mod',
    check: (c) => /github\.com\/gofiber\/fiber/i.test(c)
  },
  {
    name: 'Gorm',
    category: 'ORM',
    manifestName: 'go.mod',
    check: (c) => /gorm\.io\/gorm/i.test(c)
  },
  // Rust Frameworks
  {
    name: 'Axum',
    category: 'WEB_FRAMEWORK',
    manifestName: 'Cargo.toml',
    check: (c) => /axum\s*=/i.test(c)
  },
  {
    name: 'Actix-Web',
    category: 'WEB_FRAMEWORK',
    manifestName: 'Cargo.toml',
    check: (c) => /actix-web\s*=/i.test(c)
  },
  {
    name: 'Rocket',
    category: 'WEB_FRAMEWORK',
    manifestName: 'Cargo.toml',
    check: (c) => /rocket\s*=/i.test(c)
  },
  {
    name: 'Tokio',
    category: 'BUILD_SYSTEM',
    manifestName: 'Cargo.toml',
    check: (c) => /tokio\s*=/i.test(c)
  },
  // Java Frameworks
  {
    name: 'Spring Boot',
    category: 'WEB_FRAMEWORK',
    manifestName: 'pom.xml',
    check: (c) => /spring-boot/i.test(c)
  },
  {
    name: 'Micronaut',
    category: 'WEB_FRAMEWORK',
    manifestName: 'pom.xml',
    check: (c) => /io\.micronaut/i.test(c)
  },
  {
    name: 'Quarkus',
    category: 'WEB_FRAMEWORK',
    manifestName: 'pom.xml',
    check: (c) => /io\.quarkus/i.test(c)
  }
];

export function scanFrameworks(
  workspaceRoot: string,
  scannedFiles: readonly string[]
): DetectedFramework[] {
  const frameworks: DetectedFramework[] = [];
  const detectedKeys = new Set<string>();

  // 1. Group framework signatures by manifest name
  const signaturesByManifest = new Map<string, FrameworkSignature[]>();
  for (const sig of FRAMEWORK_SIGNATURES) {
    const list = signaturesByManifest.get(sig.manifestName) ?? [];
    list.push(sig);
    signaturesByManifest.set(sig.manifestName, list);
  }

  // 2. Inspect manifests present in scanned files (reading each manifest at most once)
  for (const relFile of scannedFiles) {
    for (const [manifestName, signatures] of signaturesByManifest.entries()) {
      if (relFile.endsWith(manifestName)) {
        let content: string;
        try {
          content = readFileSync(join(workspaceRoot, relFile), 'utf8');
        } catch {
          continue;
        }

        for (const sig of signatures) {
          if (sig.check(content)) {
            const key = `${sig.name}:${sig.category}`;
            if (!detectedKeys.has(key)) {
              detectedKeys.add(key);
              frameworks.push({
                name: sig.name,
                category: sig.category,
                manifestFile: relFile
              });
            }
          }
        }
      }
    }
  }

  // 3. Inspect CI/CD workflows
  const hasGitHubWorkflows = scannedFiles.some((f) => f.startsWith('.github/workflows/'));
  if (hasGitHubWorkflows && !detectedKeys.has('GitHub Actions:CI_CD')) {
    detectedKeys.add('GitHub Actions:CI_CD');
    frameworks.push({
      name: 'GitHub Actions',
      category: 'CI_CD',
      manifestFile: '.github/workflows/'
    });
  }

  const hasGitLabCi = scannedFiles.some((f) => f === '.gitlab-ci.yml');
  if (hasGitLabCi && !detectedKeys.has('GitLab CI:CI_CD')) {
    detectedKeys.add('GitLab CI:CI_CD');
    frameworks.push({
      name: 'GitLab CI',
      category: 'CI_CD',
      manifestFile: '.gitlab-ci.yml'
    });
  }

  // 4. Inspect Infrastructure as Code (IaC)
  const hasDocker = scannedFiles.some((f) => f.toLowerCase().includes('dockerfile'));
  if (hasDocker && !detectedKeys.has('Docker:INFRASTRUCTURE')) {
    detectedKeys.add('Docker:INFRASTRUCTURE');
    frameworks.push({
      name: 'Docker',
      category: 'INFRASTRUCTURE',
      manifestFile: scannedFiles.find((f) => f.toLowerCase().includes('dockerfile')) ?? 'Dockerfile'
    });
  }

  const hasCompose = scannedFiles.some((f) => f.includes('docker-compose') || f.includes('compose.yaml'));
  if (hasCompose && !detectedKeys.has('Docker Compose:INFRASTRUCTURE')) {
    detectedKeys.add('Docker Compose:INFRASTRUCTURE');
    frameworks.push({
      name: 'Docker Compose',
      category: 'INFRASTRUCTURE',
      manifestFile: scannedFiles.find((f) => f.includes('docker-compose') || f.includes('compose.yaml')) ?? 'docker-compose.yml'
    });
  }

  const hasTerraform = scannedFiles.some((f) => f.endsWith('.tf'));
  if (hasTerraform && !detectedKeys.has('Terraform:INFRASTRUCTURE')) {
    detectedKeys.add('Terraform:INFRASTRUCTURE');
    frameworks.push({
      name: 'Terraform',
      category: 'INFRASTRUCTURE',
      manifestFile: scannedFiles.find((f) => f.endsWith('.tf')) ?? 'main.tf'
    });
  }

  return frameworks;
}
