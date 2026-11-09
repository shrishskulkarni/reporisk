/**
 * Repository Topology & Entry-Point Models
 *
 * Epistemic Classification: DESIGN DECISION
 */

export interface DetectedLanguage {
  readonly name: string;
  readonly fileCount: number;
  readonly percentage: number;
}

export interface DetectedFramework {
  readonly name: string;
  readonly category: 'WEB_FRAMEWORK' | 'ORM' | 'BUILD_SYSTEM' | 'CI_CD' | 'TEST_RUNNER';
  readonly manifestFile: string;
}

export interface EntryPoint {
  readonly id: string;
  readonly file: string;
  readonly line: number;
  readonly routePath?: string | undefined;
  readonly method?: string | undefined;
  readonly exposure: 'PUBLIC_INGRESS' | 'AUTHENTICATED' | 'INTERNAL';
}

export interface TrustBoundary {
  readonly id: string;
  readonly name: string;
  readonly boundaryType: 'NETWORK_PERIMETER' | 'AUTH_GATEWAY' | 'DATABASE_ISOLATION' | 'CI_RUNNER';
  readonly components: readonly string[];
}

export interface TopologyMap {
  readonly repositoryRoot: string;
  readonly languages: readonly DetectedLanguage[];
  readonly frameworks: readonly DetectedFramework[];
  readonly entryPoints: readonly EntryPoint[];
  readonly trustBoundaries: readonly TrustBoundary[];
}
