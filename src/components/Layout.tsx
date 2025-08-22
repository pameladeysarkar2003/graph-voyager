import React, { useState, useCallback, useRef } from 'react';
import * as d3 from 'd3';
import { toast } from 'sonner';
import Graph from './Graph';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import { GraphData, GraphNode, initialGraphData } from '@/data/graphData';

const Layout: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>(initialGraphData);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  // Handle node selection
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setSidebarExpanded(true);
  }, []);

  // Handle sidebar close
  const handleSidebarClose = useCallback(() => {
    setSidebarExpanded(false);
    setTimeout(() => setSelectedNode(null), 300); // Wait for animation
  }, []);

  // Get connected nodes for sidebar
  const getConnectedNodes = useCallback((node: GraphNode | null): GraphNode[] => {
    if (!node) return [];
    
    const connectedNodeIds = new Set<string>();
    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      if (sourceId === node.id) {
        connectedNodeIds.add(targetId);
      } else if (targetId === node.id) {
        connectedNodeIds.add(sourceId);
      }
    });
    
    return graphData.nodes.filter(n => connectedNodeIds.has(n.id));
  }, [graphData]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (!data.nodes || !data.links || !Array.isArray(data.nodes) || !Array.isArray(data.links)) {
          throw new Error('Invalid data structure. Expected { nodes: [], links: [] }');
        }

        // Validate nodes
        data.nodes.forEach((node: any, index: number) => {
          if (!node.id || !node.label || !node.group) {
            throw new Error(`Invalid node at index ${index}. Required fields: id, label, group`);
          }
        });

        // Validate links
        data.links.forEach((link: any, index: number) => {
          if (!link.source || !link.target || !link.relation) {
            throw new Error(`Invalid link at index ${index}. Required fields: source, target, relation`);
          }
        });

        setGraphData(data);
        setSelectedNode(null);
        setSidebarExpanded(false);
        toast.success('Graph data loaded successfully!');
      } catch (error) {
        console.error('Error parsing uploaded file:', error);
        toast.error(`Error loading file: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  }, []);

  // Handle graph export
  const handleExportGraph = useCallback(() => {
    const graphElement = graphRef.current?.querySelector('svg');
    if (!graphElement) {
      toast.error('No graph to export');
      return;
    }

    try {
      // Create a canvas to render the SVG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Canvas not supported');
        return;
      }

      // Get SVG dimensions
      const svgRect = graphElement.getBoundingClientRect();
      canvas.width = svgRect.width;
      canvas.height = svgRect.height;

      // Set dark background
      ctx.fillStyle = 'hsl(220, 27%, 4%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(graphElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        
        // Download the canvas as PNG
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `knowledge-graph-${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Graph exported successfully!');
          }
        }, 'image/png');
        
        URL.revokeObjectURL(svgUrl);
      };
      
      img.onerror = () => {
        toast.error('Error exporting graph');
        URL.revokeObjectURL(svgUrl);
      };
      
      img.src = svgUrl;
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting graph');
    }
  }, []);

  const connectedNodes = getConnectedNodes(selectedNode);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Knowledge Graph Explorer
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Interactive visualization of connected knowledge domains
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {graphData.nodes.length} nodes • {graphData.links.length} connections
            </div>
          </div>
        </div>
        
        {/* Search and Controls */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onFileUpload={handleFileUpload}
          onExportGraph={handleExportGraph}
          nodes={graphData.nodes}
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Graph Area */}
        <div 
          ref={graphRef}
          className={`absolute inset-0 transition-all duration-300 ${
            sidebarExpanded ? 'right-96' : 'right-0'
          }`}
        >
          <Graph
            data={graphData}
            onNodeClick={handleNodeClick}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            onDataChange={setGraphData}
          />
        </div>

        {/* Sidebar */}
        <Sidebar
          selectedNode={selectedNode}
          onClose={handleSidebarClose}
          connectedNodes={connectedNodes}
          isExpanded={sidebarExpanded}
        />
      </main>

      {/* Instructions Overlay */}
      {!selectedNode && searchTerm === '' && (
        <div className="absolute bottom-6 left-6 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 max-w-sm shadow-card-elevated">
          <h3 className="font-semibold text-sm mb-2 text-foreground">Getting Started</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Click nodes to expand their connections</li>
            <li>• Drag nodes to reposition them</li>
            <li>• Use search to find specific topics</li>
            <li>• Filter by category to focus your view</li>
            <li>• Upload JSON files with custom data</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Layout;