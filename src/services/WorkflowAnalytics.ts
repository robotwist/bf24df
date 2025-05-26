import { GraphData, FormNode } from '../types/graph';

interface WorkflowMetrics {
  bottleneckScore: number;
  cycleTime: number;
  performanceScore: number;
  healthMetrics: {
    completeness: number;
    efficiency: number;
    compliance: number;
    risk: number;
  };
  predictiveImpact: {
    changeRisk: number;
    affectedForms: string[];
    estimatedTimeImpact: number;
  };
}

interface BottleneckAnalysis {
  formId: string;
  score: number;
  reasons: string[];
  recommendations: string[];
}

export class WorkflowAnalytics {
  private graphData: GraphData;

  constructor(graphData: GraphData) {
    this.graphData = graphData;
  }

  // Bottleneck Detection
  detectBottlenecks(): BottleneckAnalysis[] {
    const bottlenecks: BottleneckAnalysis[] = [];
    
    this.graphData.nodes.forEach(node => {
      const dependents = this.getDependentForms(node.id);
      const dependencies = this.getDependencyForms(node.id);
      
      // Calculate bottleneck score based on multiple factors
      const score = this.calculateBottleneckScore(node, dependents, dependencies);
      
      if (score > 0.7) { // High bottleneck probability
        bottlenecks.push({
          formId: node.id,
          score,
          reasons: this.identifyBottleneckReasons(node, dependents, dependencies),
          recommendations: this.generateBottleneckRecommendations(node, score)
        });
      }
    });

    return bottlenecks.sort((a, b) => b.score - a.score);
  }

  private calculateBottleneckScore(
    node: FormNode,
    dependents: FormNode[],
    dependencies: FormNode[]
  ): number {
    const factors = {
      dependentCount: dependents.length / this.graphData.nodes.length,
      dependencyCount: dependencies.length / this.graphData.nodes.length,
      criticalPath: this.isOnCriticalPath(node.id) ? 1 : 0,
      dataVolume: this.estimateDataVolume(node)
    };

    return (
      factors.dependentCount * 0.3 +
      factors.dependencyCount * 0.2 +
      factors.criticalPath * 0.3 +
      factors.dataVolume * 0.2
    );
  }

  private identifyBottleneckReasons(
    node: FormNode,
    dependents: FormNode[],
    dependencies: FormNode[]
  ): string[] {
    const reasons: string[] = [];

    if (dependents.length > 5) {
      reasons.push('High number of dependent forms');
    }
    if (dependencies.length > 3) {
      reasons.push('Complex dependency chain');
    }
    if (this.isOnCriticalPath(node.id)) {
      reasons.push('Part of critical path');
    }
    if (this.estimateDataVolume(node) > 0.8) {
      reasons.push('High data volume');
    }

    return reasons;
  }

  private generateBottleneckRecommendations(
    node: FormNode,
    score: number
  ): string[] {
    const recommendations: string[] = [];

    if (score > 0.9) {
      recommendations.push('Consider splitting form into smaller components');
      recommendations.push('Implement parallel processing where possible');
    } else if (score > 0.7) {
      recommendations.push('Optimize data validation rules');
      recommendations.push('Review and simplify form dependencies');
    }

    return recommendations;
  }

  // Cycle Time Calculation
  calculateCycleTime(formId: string): number {
    const node = this.graphData.nodes.find(n => n.id === formId);
    if (!node) return 0;

    const dependencies = this.getDependencyForms(formId);
    const baseTime = this.estimateFormCompletionTime(node);
    
    // Add time from dependencies
    const dependencyTime = dependencies.reduce((total, dep) => {
      return total + this.calculateCycleTime(dep.id);
    }, 0);

    return baseTime + dependencyTime;
  }

  private estimateFormCompletionTime(node: FormNode): number {
    // This would typically come from historical data
    // For now, using a simple estimation based on form complexity
    const fieldCount = Object.keys(node.data.field_schema?.properties || {}).length;
    return fieldCount * 2; // 2 minutes per field as a rough estimate
  }

  // Performance Scoring
  calculatePerformanceScore(formId: string): number {
    const node = this.graphData.nodes.find(n => n.id === formId);
    if (!node) return 0;

    const factors = {
      cycleTime: this.normalizeCycleTime(this.calculateCycleTime(formId)),
      dependencyEfficiency: this.calculateDependencyEfficiency(formId),
      dataQuality: this.estimateDataQuality(node),
      userExperience: this.estimateUserExperience(node)
    };

    return (
      factors.cycleTime * 0.3 +
      factors.dependencyEfficiency * 0.3 +
      factors.dataQuality * 0.2 +
      factors.userExperience * 0.2
    );
  }

  private normalizeCycleTime(time: number): number {
    // Normalize to a 0-1 scale
    const maxExpectedTime = 60; // 60 minutes
    return Math.max(0, 1 - (time / maxExpectedTime));
  }

  private calculateDependencyEfficiency(formId: string): number {
    const dependencies = this.getDependencyForms(formId);
    if (dependencies.length === 0) return 1;

    const avgDependencyTime = dependencies.reduce((total, dep) => {
      return total + this.calculateCycleTime(dep.id);
    }, 0) / dependencies.length;

    return this.normalizeCycleTime(avgDependencyTime);
  }

  // Workflow Health Metrics
  calculateWorkflowHealth(formId: string): WorkflowMetrics {
    const node = this.graphData.nodes.find(n => n.id === formId);
    if (!node) throw new Error('Form not found');

    const cycleTime = this.calculateCycleTime(formId);
    const performanceScore = this.calculatePerformanceScore(formId);
    const bottlenecks = this.detectBottlenecks();
    const bottleneckScore = bottlenecks.find(b => b.formId === formId)?.score || 0;

    return {
      bottleneckScore,
      cycleTime,
      performanceScore,
      healthMetrics: {
        completeness: this.calculateCompleteness(node),
        efficiency: this.calculateEfficiency(node),
        compliance: this.calculateCompliance(node),
        risk: this.calculateRisk(node)
      },
      predictiveImpact: this.calculatePredictiveImpact(node)
    };
  }

  private calculateCompleteness(node: FormNode): number {
    const requiredFields = node.data.field_schema?.required || [];
    const totalFields = Object.keys(node.data.field_schema?.properties || {}).length;
    return totalFields > 0 ? requiredFields.length / totalFields : 1;
  }

  private calculateEfficiency(node: FormNode): number {
    const dependencies = this.getDependencyForms(node.id);
    const dependents = this.getDependentForms(node.id);
    
    // Efficiency decreases with more dependencies and increases with more dependents
    return Math.max(0, 1 - (dependencies.length * 0.1) + (dependents.length * 0.05));
  }

  private calculateCompliance(node: FormNode): number {
    // This would integrate with HealthcareCompliance service
    return 0.8; // Placeholder
  }

  private calculateRisk(node: FormNode): number {
    const factors = {
      dependencyCount: this.getDependencyForms(node.id).length,
      criticalPath: this.isOnCriticalPath(node.id) ? 1 : 0,
      dataSensitivity: this.estimateDataSensitivity(node)
    };

    return (
      (factors.dependencyCount * 0.1) +
      (factors.criticalPath * 0.4) +
      (factors.dataSensitivity * 0.5)
    );
  }

  // Predictive Analytics
  private calculatePredictiveImpact(node: FormNode) {
    const dependents = this.getDependentForms(node.id);
    const avgCycleTime = this.calculateCycleTime(node.id);
    
    return {
      changeRisk: this.calculateChangeRisk(node),
      affectedForms: dependents.map(d => d.id),
      estimatedTimeImpact: avgCycleTime * dependents.length
    };
  }

  private calculateChangeRisk(node: FormNode): number {
    const factors = {
      dependentCount: this.getDependentForms(node.id).length,
      criticalPath: this.isOnCriticalPath(node.id) ? 1 : 0,
      dataVolume: this.estimateDataVolume(node)
    };

    return (
      (factors.dependentCount * 0.3) +
      (factors.criticalPath * 0.4) +
      (factors.dataVolume * 0.3)
    );
  }

  // Helper Methods
  private getDependentForms(formId: string): FormNode[] {
    return this.graphData.nodes.filter(node => 
      node.data.prerequisites.includes(formId)
    );
  }

  private getDependencyForms(formId: string): FormNode[] {
    const node = this.graphData.nodes.find(n => n.id === formId);
    if (!node) return [];

    return this.graphData.nodes.filter(n => 
      node.data.prerequisites.includes(n.id)
    );
  }

  private isOnCriticalPath(formId: string): boolean {
    // This would be more sophisticated in a real implementation
    const node = this.graphData.nodes.find(n => n.id === formId);
    if (!node) return false;

    return node.data.prerequisites.length > 0 && 
           this.getDependentForms(formId).length > 0;
  }

  private estimateDataVolume(node: FormNode): number {
    const fields = Object.keys(node.data.field_schema?.properties || {});
    return Math.min(1, fields.length / 20); // Normalize to 0-1 scale
  }

  private estimateDataQuality(node: FormNode): number {
    // This would integrate with actual data quality metrics
    return 0.9; // Placeholder
  }

  private estimateUserExperience(node: FormNode): number {
    // This would integrate with user feedback and metrics
    return 0.85; // Placeholder
  }

  private estimateDataSensitivity(node: FormNode): number {
    // This would integrate with data classification system
    return 0.7; // Placeholder
  }
} 