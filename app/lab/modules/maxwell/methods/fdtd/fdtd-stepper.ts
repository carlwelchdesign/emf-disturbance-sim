/**
 * FDTD Yee-Grid Time-Step Update Routines
 * 
 * Implements the standard Yee cell staggered grid update equations for 3D FDTD:
 * - E-field update: E(n+1/2) = CA * E(n-1/2) + CB * (curl H)
 * - H-field update: H(n+1) = DA * H(n) + DB * (curl E)
 * 
 * ARCHITECTURE: Pure computation — no imports from app layer.
 * 
 * Reference: K.S. Yee, "Numerical solution of initial boundary value problems
 * involving Maxwell's equations in isotropic media," IEEE TAP, 1966.
 */

import { EPSILON_0, MU_0 } from '../../core/maxwell-constants';

export interface StabilityCheckResult {
  stable: boolean;
  reason?: string;
  maxEField?: number;
  maxHField?: number;
}

/**
 * 3D FDTD Stepper using Yee cell staggered grid with leap-frog time integration.
 */
export class FDTDStepper {
  readonly nx: number;
  readonly ny: number;
  readonly nz: number;
  readonly dx: number;
  readonly dy: number;
  readonly dz: number;
  readonly dt: number;

  // Electric field components [nx*ny*nz]
  private Ex: Float64Array;
  private Ey: Float64Array;
  private Ez: Float64Array;

  // Magnetic field components (on half-step)
  private Hx: Float64Array;
  private Hy: Float64Array;
  private Hz: Float64Array;

  // Material update coefficients
  private CA: Float64Array; // E-field coefficient
  private CB: Float64Array; // E-field curl coefficient
  private DA: Float64Array; // H-field coefficient
  private DB: Float64Array; // H-field curl coefficient

  private step_count = 0;
  private stableThreshold = 1e10; // field magnitude threshold for instability detection

  constructor(nx: number, ny: number, nz: number, dx: number, dy: number, dz: number, dt: number) {
    this.nx = nx;
    this.ny = ny;
    this.nz = nz;
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;
    this.dt = dt;

    const n = nx * ny * nz;
    this.Ex = new Float64Array(n);
    this.Ey = new Float64Array(n);
    this.Ez = new Float64Array(n);
    this.Hx = new Float64Array(n);
    this.Hy = new Float64Array(n);
    this.Hz = new Float64Array(n);
    this.CA = new Float64Array(n).fill(1.0);
    this.CB = new Float64Array(n).fill(dt / (EPSILON_0 * dx));
    this.DA = new Float64Array(n).fill(1.0);
    this.DB = new Float64Array(n).fill(dt / (MU_0 * dx));
  }

  /** Initialize material update coefficients from relative ε_r, μ_r, σ */
  initMaterials(eps_r: number, mu_r: number, sigma: number): void {
    const dt = this.dt;
    const eps = EPSILON_0 * eps_r;
    const mu = MU_0 * mu_r;

    // FDTD update coefficients (standard exponential time-stepping for lossy media):
    // CA = (1 - sigma*dt/(2*eps)) / (1 + sigma*dt/(2*eps))
    // CB = (dt/eps) / (1 + sigma*dt/(2*eps))
    const alpha = sigma * dt / (2 * eps);
    const caVal = (1 - alpha) / (1 + alpha);
    const cbVal = (dt / eps) / (1 + alpha);
    const daVal = 1.0; // lossless magnetic (no magnetic conductivity)
    const dbVal = dt / mu;

    this.CA.fill(caVal);
    this.CB.fill(cbVal);
    this.DA.fill(daVal);
    this.DB.fill(dbVal);
  }

  /** Linear index for (i, j, k) */
  private idx(i: number, j: number, k: number): number {
    return i * this.ny * this.nz + j * this.nz + k;
  }

  /** Apply a Gaussian pulse source at (si, sj, sk) */
  applyGaussianSource(si: number, sj: number, sk: number, amplitude = 1.0): void {
    const t = this.step_count * this.dt;
    const t0 = 30 * this.dt;
    const tw = 10 * this.dt;
    const pulse = amplitude * Math.exp(-((t - t0) * (t - t0)) / (2 * tw * tw));
    const i = Math.min(si, this.nx - 1);
    const j = Math.min(sj, this.ny - 1);
    const k = Math.min(sk, this.nz - 1);
    this.Ez[this.idx(i, j, k)] += pulse;
  }

  /**
   * Perform one FDTD leap-frog time step:
   * 1. Update H from curl E
   * 2. Apply boundary conditions (PEC — zero tangential E)
   * 3. Update E from curl H
   */
  step(): void {
    const { nx, ny, nz, dx, dy, dz } = this;

    // --- Update H from curl E ---
    for (let i = 0; i < nx - 1; i++) {
      for (let j = 0; j < ny - 1; j++) {
        for (let k = 0; k < nz - 1; k++) {
          const idx000 = this.idx(i, j, k);
          const idxI1 = this.idx(i+1, j, k);
          const idxJ1 = this.idx(i, j+1, k);
          const idxK1 = this.idx(i, j, k+1);

          // dEz/dy - dEy/dz
          const curlHx = (this.Ez[idxJ1] - this.Ez[idx000]) / dy - (this.Ey[idxK1] - this.Ey[idx000]) / dz;
          // dEx/dz - dEz/dx
          const curlHy = (this.Ex[idxK1] - this.Ex[idx000]) / dz - (this.Ez[idxI1] - this.Ez[idx000]) / dx;
          // dEy/dx - dEx/dy
          const curlHz = (this.Ey[idxI1] - this.Ey[idx000]) / dx - (this.Ex[idxJ1] - this.Ex[idx000]) / dy;

          this.Hx[idx000] = this.DA[idx000] * this.Hx[idx000] - this.DB[idx000] * curlHx;
          this.Hy[idx000] = this.DA[idx000] * this.Hy[idx000] - this.DB[idx000] * curlHy;
          this.Hz[idx000] = this.DA[idx000] * this.Hz[idx000] - this.DB[idx000] * curlHz;
        }
      }
    }

    // --- Apply source excitation (Gaussian pulse) ---
    this.applyGaussianSource(Math.floor(nx / 2), Math.floor(ny / 2), Math.floor(nz / 2));

    // --- Update E from curl H ---
    for (let i = 1; i < nx - 1; i++) {
      for (let j = 1; j < ny - 1; j++) {
        for (let k = 1; k < nz - 1; k++) {
          const idx000 = this.idx(i, j, k);
          const idxIm1 = this.idx(i-1, j, k);
          const idxJm1 = this.idx(i, j-1, k);
          const idxKm1 = this.idx(i, j, k-1);

          // dHz/dy - dHy/dz
          const curlEx = (this.Hz[idx000] - this.Hz[idxJm1]) / dy - (this.Hy[idx000] - this.Hy[idxKm1]) / dz;
          // dHx/dz - dHz/dx
          const curlEy = (this.Hx[idx000] - this.Hx[idxKm1]) / dz - (this.Hz[idx000] - this.Hz[idxIm1]) / dx;
          // dHy/dx - dHx/dy
          const curlEz = (this.Hy[idx000] - this.Hy[idxIm1]) / dx - (this.Hx[idx000] - this.Hx[idxJm1]) / dy;

          this.Ex[idx000] = this.CA[idx000] * this.Ex[idx000] + this.CB[idx000] * curlEx;
          this.Ey[idx000] = this.CA[idx000] * this.Ey[idx000] + this.CB[idx000] * curlEy;
          this.Ez[idx000] = this.CA[idx000] * this.Ez[idx000] + this.CB[idx000] * curlEz;
        }
      }
    }

    // --- Apply PEC boundary conditions (zero tangential E on all faces) ---
    this.applyPECBoundary();

    this.step_count++;
  }

  /** Apply PEC (Perfect Electric Conductor) boundary conditions — zero tangential E on all faces */
  private applyPECBoundary(): void {
    const { nx, ny, nz } = this;

    // x=0 and x=nx-1 faces
    for (let j = 0; j < ny; j++) {
      for (let k = 0; k < nz; k++) {
        this.Ey[this.idx(0, j, k)] = 0;
        this.Ez[this.idx(0, j, k)] = 0;
        this.Ey[this.idx(nx-1, j, k)] = 0;
        this.Ez[this.idx(nx-1, j, k)] = 0;
      }
    }
    // y=0 and y=ny-1 faces
    for (let i = 0; i < nx; i++) {
      for (let k = 0; k < nz; k++) {
        this.Ex[this.idx(i, 0, k)] = 0;
        this.Ez[this.idx(i, 0, k)] = 0;
        this.Ex[this.idx(i, ny-1, k)] = 0;
        this.Ez[this.idx(i, ny-1, k)] = 0;
      }
    }
    // z=0 and z=nz-1 faces
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        this.Ex[this.idx(i, j, 0)] = 0;
        this.Ey[this.idx(i, j, 0)] = 0;
        this.Ex[this.idx(i, j, nz-1)] = 0;
        this.Ey[this.idx(i, j, nz-1)] = 0;
      }
    }
  }

  /** Check stability — detect NaN, Inf, or diverging fields */
  checkStability(): StabilityCheckResult {
    let maxE = 0;
    let maxH = 0;

    for (let i = 0; i < this.Ex.length; i++) {
      const eVal = Math.abs(this.Ex[i]) + Math.abs(this.Ey[i]) + Math.abs(this.Ez[i]);
      const hVal = Math.abs(this.Hx[i]) + Math.abs(this.Hy[i]) + Math.abs(this.Hz[i]);
      if (!isFinite(eVal) || !isFinite(hVal)) {
        return { stable: false, reason: `Non-finite field values detected at cell ${i}.`, maxEField: eVal, maxHField: hVal };
      }
      maxE = Math.max(maxE, eVal);
      maxH = Math.max(maxH, hVal);
    }

    if (maxE > this.stableThreshold || maxH > this.stableThreshold) {
      return { stable: false, reason: `Field divergence detected: max|E|=${maxE.toExponential(3)}, max|H|=${maxH.toExponential(3)}.`, maxEField: maxE, maxHField: maxH };
    }

    return { stable: true, maxEField: maxE, maxHField: maxH };
  }

  /** Get snapshot of current E-field as plain arrays */
  getElectricSnapshot(): { ex: number[]; ey: number[]; ez: number[] } {
    return {
      ex: Array.from(this.Ex),
      ey: Array.from(this.Ey),
      ez: Array.from(this.Ez),
    };
  }

  /** Get snapshot of current H-field as plain arrays */
  getMagneticSnapshot(): { ex: number[]; ey: number[]; ez: number[] } {
    return {
      ex: Array.from(this.Hx),
      ey: Array.from(this.Hy),
      ez: Array.from(this.Hz),
    };
  }

  /** Get current step count */
  getStepCount(): number {
    return this.step_count;
  }

  /** Reset stepper to initial state */
  reset(): void {
    this.Ex.fill(0);
    this.Ey.fill(0);
    this.Ez.fill(0);
    this.Hx.fill(0);
    this.Hy.fill(0);
    this.Hz.fill(0);
    this.step_count = 0;
  }
}
