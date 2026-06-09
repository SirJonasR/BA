import { Injectable } from '@angular/core';
import { Technology } from 'src/app/models/technology';

@Injectable({
  providedIn: 'root',
})
export class RadarMathService {
  /**
   * Calculate optimal radii based on technology distribution
   */
  calculateRadii(
    technologies: Technology[],
    outerRadius: number,
    techRadius: number,
  ): number[] {
    const minWidth = 2 * techRadius;
    const techCounts = this.getTechnologyCountsByCategory(technologies);
    const minAreas = this.calculateMinimumAreas(techCounts, techRadius);
    const minRadii = this.calculateMinimumRadii(minAreas);

    for (let i = 0; i < minRadii.length; i++) {
      const inner = i === 0 ? 0 : minRadii[i - 1];
      const outer = minRadii[i];
      const width = outer - inner;

      if (width < minWidth) {
        minRadii[i] = inner + minWidth;
      }
    }
    const radii = this.scaleArray(minRadii, outerRadius);
    return radii;
  }

  /**
   * Get technology counts by category (excludes lifecycle -5 (-5 is category 'Undefined' and not wanted)
   */
  getTechnologyCountsByCategory(technologies: Technology[]): number[] {
    const tech: Technology[] = technologies.filter(
      (tech) => tech.lifecycleId !== -5,
    );

    const lifecycleMap = new Map<number, Map<number, number>>();
    for (let i = -4; i < 0; i++) {
      lifecycleMap.set(i, new Map<number, number>());
      const categoryMap = lifecycleMap.get(i);
      if (categoryMap !== undefined) {
        categoryMap.set(0, 0);
      }
    }

    tech.forEach(({ categoryId, lifecycleId }) => {
      if (!lifecycleMap.has(lifecycleId)) {
        lifecycleMap.set(lifecycleId, new Map());
      }
      const categoryMap = lifecycleMap.get(lifecycleId);
      if (categoryMap !== undefined) {
        categoryMap.set(categoryId, (categoryMap.get(categoryId) || 0) + 1);
      }
    });
    const count: number[] = this.extractMaximumCountPerLifecycle(lifecycleMap);
    return count;
  }

  /**
   * Extract maximum count per lifecycle
   */
  extractMaximumCountPerLifecycle(
    lifecycleMap: Map<number, Map<number, number>>,
  ): number[] {
    return Array.from(lifecycleMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map((element) => element[1])
      .map((categoryMap: Map<number, number>) =>
        Math.max(...categoryMap.values()),
      );
  }

  /**
   * Calculate minimum radii from areas
   */
  calculateMinimumRadii(minArea: number[]): number[] {
    const cumulativeAreas: number[] = [];
    let sum = 0;

    for (const area of minArea) {
      sum += area;
      cumulativeAreas.push(sum);
    }

    return cumulativeAreas.map((area) => Math.sqrt((area * 4) / Math.PI));
  }

  /**
   * Calculate minimum areas for technology counts
   */
  calculateMinimumAreas(techCounts: number[], techWidth: number): number[] {
    const techArea = Math.PI * techWidth * techWidth;
    return techCounts.map((count) => count * techArea);
  }

  /**
   * Scale array to target maximum
   */
  scaleArray(arr: number[], target: number): number[] {
    if (arr.length === 0) throw new Error('Array darf nicht leer sein');

    const lastElement = arr[arr.length - 1];
    if (lastElement === 0)
      throw new Error('Das letzte Element darf nicht 0 sein');

    const scaleFactor = target / lastElement;

    return arr.map((num) => num * scaleFactor);
  }

  /**
   * Calculate ring radius with minimum inner radius
   */
  calculateRingRadius(
    ringIndex: number,
    totalRings: number,
    maxRadius: number,
  ): number {
    const minInnerRadius = 60;
    const availableRadius = maxRadius - minInnerRadius;
    const ringSpacing = availableRadius / totalRings;

    return minInnerRadius + ringSpacing * (ringIndex + 1);
  }

  /**
   * Calculate sector angles for dynamic positioning
   */
  calculateSectorAngles(
    sectorIndex: number,
    totalSectors: number,
  ): {
    startAngle: number;
    endAngle: number;
    centerAngle: number;
  } {
    const angleStep = (2 * Math.PI) / totalSectors;
    const startAngle = sectorIndex * angleStep - Math.PI / 2;
    const endAngle = (sectorIndex + 1) * angleStep - Math.PI / 2;
    const centerAngle = (sectorIndex + 0.5) * angleStep - Math.PI / 2;

    return { startAngle, endAngle, centerAngle };
  }

  /**
   * Get quadrant index from category ID
   */
  getCategoryQuadrant(
    categoryId: number,
    categories: { id: number }[],
  ): number {
    const categoryIndex = categories.findIndex((cat) => cat.id === categoryId);
    return categoryIndex >= 0 ? categoryIndex : 0;
  }

  /**
   * Get ring index from lifecycle ID
   */
  getLifecycleRing(lifecycleId: number, lifecycles: { id: number }[]): number {
    const lifecycleIndex = lifecycles.findIndex((lc) => lc.id === lifecycleId);
    return lifecycleIndex >= 0 ? lifecycleIndex : 0;
  }
}
