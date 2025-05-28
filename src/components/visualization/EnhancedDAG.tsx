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
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);
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
      if (node) {
        node.data.prerequisites.forEach(prereqId => {
          assignLevels(prereqId, level + 1);
        });
      }
    };

    // Start with nodes that have no prerequisites
    graphData.nodes
      .filter(node => node.data.prerequisites.length === 0)
      .forEach(node => assignLevels(node.id, 0));

    // Second pass: position nodes
    const levelNodes = new Map<number, string[]>();
    levels.forEach((level, nodeId) => {
      if (!levelNodes.has(level)) {
        levelNodes.set(level, []);
      }
      levelNodes.get(level)?.push(nodeId);
    });

    const levelWidth = 200;
    const nodeHeight = 100;
    const padding = 50;

    levelNodes.forEach((nodes, level) => {
      nodes.forEach((nodeId, index) => {
        newPositions[nodeId] = {
          x: level * levelWidth + padding,
          y: index * nodeHeight + padding,
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
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handlePanEnd = () => {
    setIsDragging(false);
  };

  const handleNodeHover = (nodeId: string) => {
    setHoveredNode(nodeId);
  };

  const handleNodeLeave = () => {
    setHoveredNode(null);
  };

  const getNodeStyle = (nodeId: string) => {
    const position = positions[nodeId];
    const isSelected = nodeId === selectedFormId;
    const isHovered = nodeId === hoveredNode;
    const node = graphData.nodes.find(n => n.id === nodeId);
    const healthScore = workflowAnalytics.calculateWorkflowHealth(nodeId).healthMetrics;

    return {
      transform: `translate(${position.x + pan.x}px, ${position.y + pan.y}px) scale(${zoom})`,
      backgroundColor: isSelected ? '#e3f2fd' : isHovered ? '#f5f5f5' : 'white',
      borderColor: isSelected ? '#2196F3' : isHovered ? '#9e9e9e' : '#e0e0e0',
      boxShadow: isSelected ? '0 0 0 2px #2196F3' : isHovered ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
      opacity: healthScore.completeness
    };
  };

  const renderMinimap = () => {
    if (!showMinimap) return null;

    const containerWidth = containerRef.current?.clientWidth || 0;
    const containerHeight = containerRef.current?.clientHeight || 0;
    const scale = 0.2;

    return (
      <div className={styles.minimap}>
        {graphData.nodes.map(node => {
          const position = positions[node.id];
          return (
            <div
              key={node.id}
              className={styles.minimapNode}
              style={{
                left: `${position.x * scale}px`,
                top: `${position.y * scale}px`,
                backgroundColor: node.id === selectedFormId ? '#2196F3' : '#9e9e9e'
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={styles.dagContainer}
      onMouseDown={handlePanStart}
      onMouseMove={handlePanMove}
      onMouseUp={handlePanEnd}
      onMouseLeave={handlePanEnd}
    >
      <div className={styles.controls}>
        <div className={styles.zoomControls}>
          <button onClick={() => handleZoom(0.1)}>+</button>
          <button onClick={() => handleZoom(-0.1)}>-</button>
        </div>
        <div className={styles.layerControls}>
          {LAYERS.map(layer => (
            <label key={layer.id} className={styles.layerToggle}>
              <input
                type="checkbox"
                checked={activeLayers.includes(layer.id)}
                onChange={() => {
                  setActiveLayers(prev =>
                    prev.includes(layer.id)
                      ? prev.filter(id => id !== layer.id)
                      : [...prev, layer.id]
                  );
                }}
              />
              {layer.name}
            </label>
          ))}
        </div>
        <button
          className={styles.minimapToggle}
          onClick={() => setShowMinimap(!showMinimap)}
        >
          {showMinimap ? 'Hide Minimap' : 'Show Minimap'}
        </button>
      </div>

      <div className={styles.graph}>
        {graphData.nodes.map(node => (
          <div
            key={node.id}
            className={styles.node}
            style={getNodeStyle(node.id)}
            onClick={() => onFormSelect?.(node.id)}
            onMouseEnter={() => handleNodeHover(node.id)}
            onMouseLeave={handleNodeLeave}
          >
            <div className={styles.nodeContent}>
              <h4>{node.data.name}</h4>
              <div className={styles.nodeStats}>
                <span>{node.data.prerequisites.length} deps</span>
                <span>{Object.keys(node.data.input_mapping).length} fields</span>
              </div>
            </div>
            {node.data.prerequisites.length > 0 && (
              <div className={styles.dependencies}>
                {node.data.prerequisites.map(prereqId => {
                  const prereq = graphData.nodes.find(n => n.id === prereqId);
                  return (
                    <div
                      key={prereqId}
                      className={`${styles.dependency} ${
                        hoveredNode === prereqId ? styles.hovered : ''
                      }`}
                    >
                      ← {prereq?.data.name || prereqId}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {renderMinimap()}
    </div>
  );
}; 