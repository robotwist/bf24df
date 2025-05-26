import React, { useState, useEffect, useRef } from 'react';
import { GraphData, FormNode } from '../../types/graph';
import { WorkflowAnalytics } from '../../services/WorkflowAnalytics';
import { HealthcareCompliance } from '../../services/HealthcareCompliance';
import styles from '../../styles/EnhancedDAG.module.css';

interface EnhancedDAGProps {
  graphData: GraphData;
  selectedFormId?: string;
  onFormSelect?: (formId: string) => void;
}

interface NodePosition {
  x: number;
  y: number;
  level: number;
}

interface VisualizationLayer {
  id: string;
  name: string;
  color: string;
  opacity: number;
}

const LAYERS: VisualizationLayer[] = [
  { id: 'compliance', name: 'Compliance', color: '#4CAF50', opacity: 0.3 },
  { id: 'performance', name: 'Performance', color: '#2196F3', opacity: 0.3 },
  { id: 'clinical', name: 'Clinical', color: '#9C27B0', opacity: 0.3 }
];

export const EnhancedDAG: React.FC<EnhancedDAGProps> = ({
  graphData,
  selectedFormId,
  onFormSelect
}) => {
  const [positions, setPositions] = useState<{[key: string]: NodePosition}>({});
  const [activeLayers, setActiveLayers] = useState<string[]>(['compliance']);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const workflowAnalytics = new WorkflowAnalytics(graphData);
  const healthcareCompliance = new HealthcareCompliance(graphData);

  useEffect(() => {
    calculateLayout();
  }, [graphData]);

  const calculateLayout = () => {
    const newPositions: {[key: string]: NodePosition} = {};
    const levels = new Map<string, number>();
    const visited = new Set<string>();

    // First pass: assign levels
    const assignLevels = (nodeId: string, level: number) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      levels.set(nodeId, level);

      const node = graphData.nodes.find(n => n.id === nodeId);
      if (!node) return;

      node.data.prerequisites.forEach(prereqId => {
        assignLevels(prereqId, level + 1);
      });
    };

    // Start from leaf nodes
    graphData.nodes.forEach(node => {
      if (node.data.prerequisites.length === 0) {
        assignLevels(node.id, 0);
      }
    });

    // Second pass: calculate positions
    const levelNodes = new Map<number, string[]>();
    levels.forEach((level, nodeId) => {
      if (!levelNodes.has(level)) {
        levelNodes.set(level, []);
      }
      levelNodes.get(level)?.push(nodeId);
    });

    levelNodes.forEach((nodes, level) => {
      const levelWidth = nodes.length * 200; // 200px spacing between nodes
      nodes.forEach((nodeId, index) => {
        newPositions[nodeId] = {
          x: index * 200 - levelWidth / 2,
          y: level * 150, // 150px vertical spacing
          level
        };
      });
    });

    setPositions(newPositions);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const handlePanStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePanEnd = () => {
    setIsDragging(false);
  };

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const getNodeMetrics = (node: FormNode) => {
    const health = workflowAnalytics.calculateWorkflowHealth(node.id);
    const compliance = healthcareCompliance.analyzeDataFlow(node.id);
    
    return {
      performance: health.performanceScore,
      compliance: compliance.reduce((score, flow) => 
        score + (flow.sensitivity === 'high' ? 1 : 0.5), 0
      ) / compliance.length,
      clinical: health.healthMetrics.completeness
    };
  };

  const renderNode = (node: FormNode) => {
    const position = positions[node.id];
    if (!position) return null;

    const metrics = getNodeMetrics(node);
    const isSelected = node.id === selectedFormId;

    return (
      <g
        key={node.id}
        transform={`translate(${position.x + pan.x}, ${position.y + pan.y})`}
        onClick={() => onFormSelect?.(node.id)}
        className={`${styles.node} ${isSelected ? styles.selected : ''}`}
      >
        <rect
          width="120"
          height="60"
          rx="8"
          fill="white"
          stroke={isSelected ? '#3b82f6' : '#e5e7eb'}
          strokeWidth={isSelected ? 2 : 1}
        />
        <text
          x="60"
          y="30"
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles.nodeLabel}
        >
          {node.data.name}
        </text>
        {activeLayers.map(layer => (
          <rect
            key={layer}
            width="120"
            height="60"
            rx="8"
            fill={LAYERS.find(l => l.id === layer)?.color}
            opacity={metrics[layer as keyof typeof metrics] * 
              (LAYERS.find(l => l.id === layer)?.opacity || 0.3)}
            className={styles.layerOverlay}
          />
        ))}
      </g>
    );
  };

  const renderEdges = () => {
    return graphData.edges.map(edge => {
      const sourcePos = positions[edge.source];
      const targetPos = positions[edge.target];
      if (!sourcePos || !targetPos) return null;

      return (
        <g key={`${edge.source}-${edge.target}`} className={styles.edge}>
          <path
            d={`M ${sourcePos.x + pan.x + 60} ${sourcePos.y + pan.y + 30} 
                C ${(sourcePos.x + targetPos.x) / 2 + pan.x} ${sourcePos.y + pan.y + 30},
                  ${(sourcePos.x + targetPos.x) / 2 + pan.x} ${targetPos.y + pan.y + 30},
                  ${targetPos.x + pan.x + 60} ${targetPos.y + pan.y + 30}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          <circle
            cx={targetPos.x + pan.x + 60}
            cy={targetPos.y + pan.y + 30}
            r="4"
            fill="#e5e7eb"
          />
        </g>
      );
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.layerControls}>
          {LAYERS.map(layer => (
            <button
              key={layer.id}
              className={`${styles.layerButton} ${
                activeLayers.includes(layer.id) ? styles.active : ''
              }`}
              onClick={() => toggleLayer(layer.id)}
              style={{ backgroundColor: layer.color }}
            >
              {layer.name}
            </button>
          ))}
        </div>
        <div className={styles.zoomControls}>
          <button onClick={() => handleZoom(0.1)}>+</button>
          <button onClick={() => handleZoom(-0.1)}>-</button>
        </div>
      </div>
      <div
        ref={containerRef}
        className={styles.graphContainer}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
      >
        <svg
          className={styles.graph}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center'
          }}
        >
          {renderEdges()}
          {graphData.nodes.map(renderNode)}
        </svg>
      </div>
    </div>
  );
}; 