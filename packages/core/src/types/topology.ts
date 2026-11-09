/**
 * Repository Topology & Entry-Point Models
 *
 * Epistemic Classification: DESIGN DECISION
 */

export interface DetectedLanguage {
  readonly name: string;
  readonly fileCount: number;
  readonly percentage: number;
  readonly byteCount?: number | undefined;
}

export interface DetectedFramework {
  readonly name: string;
  readonly category: 'WEB_FRAMEWORK' | 'ORM' | 'BUILD_SYSTEM' | 'CI_CD' | 'TEST_RUNNER' | 'INFRASTRUCTURE';
  readonly manifestFile: string;
  readonly version?: string | undefined;
}

export interface EntryPoint {
  readonly id: string;
  readonly file: string;
  readonly line: number;
  readonly routePath?: string | undefined;
  readonly method?: string | undefined;
  readonly exposure: 'PUBLIC_INGRESS' | 'AUTHENTICATED' | 'INTERNAL';
  readonly framework?: string | undefined;
}

export interface TrustBoundary {
  readonly id: string;
  readonly name: string;
  readonly boundaryType: 'NETWORK_PERIMETER' | 'AUTH_GATEWAY' | 'DATABASE_ISOLATION' | 'CI_RUNNER';
  readonly components: readonly string[];
  readonly description?: string | undefined;
}

export interface TopologyMap {
  readonly repositoryRoot: string;
  readonly commitSha?: string | undefined;
  readonly languages: readonly DetectedLanguage[];
  readonly frameworks: readonly DetectedFramework[];
  readonly entryPoints: readonly EntryPoint[];
  readonly trustBoundaries: readonly TrustBoundary[];
  readonly totalFiles: number;
  readonly totalBytes: number;
}
