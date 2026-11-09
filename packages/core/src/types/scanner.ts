/**
 * Scanner Execution Contracts (Category A Tools)
 *
 * Epistemic Classification: DESIGN DECISION
 */

export type CategoryAScannerId = 'gitleaks' | 'semgrep' | 'osv-scanner' | 'checkov';

export interface ScannerExecutionConfig {
  readonly timeoutMs: number; // Max 120,000ms
  readonly maxBufferBytes: number; // Max 52,428,800 bytes (50MB)
  readonly memoryLimitMb: number; // Max 2,048MB
  readonly workingDirectory: string;
}

export interface ScannerExecutionResult {
  readonly scannerId: CategoryAScannerId;
  readonly exitCode: number | null;
  readonly timedOut: boolean;
  readonly executionTimeMs: number;
  readonly rawStdout: string;
  readonly rawStderr: string;
  readonly command: string;
  readonly args: readonly string[];
}

export interface ScannerAvailability {
  readonly scannerId: CategoryAScannerId;
  readonly isAvailable: boolean;
  readonly binaryPath?: string | undefined;
  readonly version?: string | undefined;
  readonly error?: string | undefined;
}
