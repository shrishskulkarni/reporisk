/**
 * Ingestion Engine Types & Execution Contracts
 *
 * Epistemic Classification: DESIGN DECISION
 */

export type IngestionTargetType = 'LOCAL_DIRECTORY' | 'REMOTE_GIT_URL';

export interface IngestionOptions {
  readonly cloneTimeoutMs?: number | undefined;
  readonly tempDirRoot?: string | undefined;
  readonly maxDepth?: number | undefined;
}

export interface IngestedRepository {
  readonly workspacePath: string;
  readonly targetType: IngestionTargetType;
  readonly target: string;
  readonly commitSha: string;
  readonly isTemporary: boolean;
  readonly cleanup: () => Promise<void>;
}

export class SecurityBoundaryViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityBoundaryViolationError';
  }
}
