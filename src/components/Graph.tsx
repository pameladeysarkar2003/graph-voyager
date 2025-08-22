import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink, getNodeColor, expandedNodes, expandedLinks } from '@/data/graphData';

interface GraphProps {
  data: { nodes: GraphNode[]; links: GraphLink[] };
  onNodeClick?: (node: GraphNode) => void;
  searchTerm?: string;
  selectedCategory?: string;
  onDataChange?: (data: { nodes: GraphNode[]; links: GraphLink[] }) => void;
}

const Graph: React.FC<GraphProps> = ({ 
  data, 
  onNodeClick, 
  searchTerm = '', 
  selectedCategory = 'all',
  onDataChange 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Filter nodes and links based on search and category
  const filteredData = React.useMemo(() => {
    let nodes = [...data.nodes];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      nodes = nodes.filter(node => node.group === selectedCategory);
    }
    
    // Filter links to only include those with both nodes present
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = data.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });
    
    return { nodes, links };
  }, [data, selectedCategory]);

  // Handle node expansion
  const handleNodeExpansion = useCallback((clickedNode: GraphNode) => {
    if (!onDataChange) return;

    // Check if node is already expanded
    if (clickedNode.expanded) {
      onNodeClick?.(clickedNode);
      return;
    }

    // Get expansion data for this node
    const newNodes = expandedNodes[clickedNode.id] || [];
    const newLinks = expandedLinks[clickedNode.id] || [];

    if (newNodes.length === 0) {
      onNodeClick?.(clickedNode);
      return;
    }

    // Add new nodes and links to the graph
    const updatedNodes = [...data.nodes];
    const updatedLinks = [...data.links];

    // Mark the clicked node as expanded
    const nodeIndex = updatedNodes.findIndex(n => n.id === clickedNode.id);
    if (nodeIndex >= 0) {
      updatedNodes[nodeIndex] = { ...updatedNodes[nodeIndex], expanded: true };
    }

    // Add new nodes if they don't already exist
    newNodes.forEach(newNode => {
      if (!updatedNodes.find(n => n.id === newNode.id)) {
        updatedNodes.push(newNode);
      }
    });

    // Add new links if they don't already exist
    newLinks.forEach(newLink => {
      const linkExists = updatedLinks.find(l => {
        const lSource = typeof l.source === 'string' ? l.source : l.source.id;
        const lTarget = typeof l.target === 'string' ? l.target : l.target.id;
        const newSource = typeof newLink.source === 'string' ? newLink.source : newLink.source.id;
        const newTarget = typeof newLink.target === 'string' ? newLink.target : newLink.target.id;
        return (lSource === newSource && lTarget === newTarget) ||
               (lSource === newTarget && lTarget === newSource);
      });
      
      if (!linkExists) {
        updatedLinks.push(newLink);
      }
    });

    onDataChange({ nodes: updatedNodes, links: updatedLinks });
    onNodeClick?.(clickedNode);
  }, [data, onDataChange, onNodeClick]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // D3 graph rendering
  useEffect(() => {
    if (!svgRef.current || filteredData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Create simulation
    const simulation = d3.forceSimulation(filteredData.nodes as any)
      .force('link', d3.forceLink(filteredData.links as any)
        .id((d: any) => d.id)
        .strength(0.5)
        .distance(80)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create container group
    const container = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Add links
    const link = container.append('g')
      .selectAll('line')
      .data(filteredData.links)
      .enter()
      .append('line')
      .attr('stroke', 'hsl(var(--edge-default))')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt((d.strength || 1) * 3));

    // Add link labels
    const linkLabel = container.append('g')
      .selectAll('text')
      .data(filteredData.links)
      .enter()
      .append('text')
      .attr('font-size', '10px')
      .attr('fill', 'hsl(var(--muted-foreground))')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .text((d: any) => d.relation)
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Add nodes
    const node = container.append('g')
      .selectAll('circle')
      .data(filteredData.nodes)
      .enter()
      .append('circle')
      .attr('r', (d: any) => Math.sqrt((d.size || 10) * 2))
      .attr('fill', (d: any) => getNodeColor(d.group))
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
      .call(d3.drag<any, any>()
        .on('start', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Add node labels
    const nodeLabel = container.append('g')
      .selectAll('text')
      .data(filteredData.nodes)
      .enter()
      .append('text')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', 'hsl(var(--foreground))')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .text((d: any) => d.label)
      .style('pointer-events', 'none');

    // Node interactions
    node
      .on('click', (event, d: any) => {
        event.stopPropagation();
        handleNodeExpansion(d);
      })
      .on('mouseenter', function(event, d: any) {
        // Highlight node
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', Math.sqrt((d.size || 10) * 2.5))
          .attr('stroke-width', 3);

        // Show connected links
        link
          .style('stroke-opacity', (l: any) => {
            const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
            const targetId = typeof l.target === 'string' ? l.target : l.target.id;
            return (sourceId === d.id || targetId === d.id) ? 1 : 0.1;
          });

        // Show link labels for connected edges
        linkLabel
          .style('opacity', (l: any) => {
            const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
            const targetId = typeof l.target === 'string' ? l.target : l.target.id;
            return (sourceId === d.id || targetId === d.id) ? 1 : 0;
          });
      })
      .on('mouseleave', function(event, d: any) {
        // Reset node
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', Math.sqrt((d.size || 10) * 2))
          .attr('stroke-width', 2);

        // Reset links
        link.style('stroke-opacity', 0.6);
        linkLabel.style('opacity', 0);
      });

    // Handle search highlighting
    if (searchTerm) {
      node.style('opacity', (d: any) => 
        d.label.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0.3
      );
      nodeLabel.style('opacity', (d: any) => 
        d.label.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0.3
      );
    } else {
      node.style('opacity', 1);
      nodeLabel.style('opacity', 1);
    }

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabel
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      nodeLabel
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredData, dimensions, searchTerm, handleNodeExpansion]);

  return (
    <div className="w-full h-full bg-graph-background">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
      {filteredData.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-semibold mb-2">No nodes to display</p>
            <p className="text-sm">Try adjusting your filters or search term</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Graph;