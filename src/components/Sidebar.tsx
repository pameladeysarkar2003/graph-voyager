import React from 'react';
import { X, Circle, Users, Zap, Tags, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GraphNode } from '@/data/graphData';

interface SidebarProps {
  selectedNode: GraphNode | null;
  onClose: () => void;
  connectedNodes: GraphNode[];
  isExpanded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  selectedNode, 
  onClose, 
  connectedNodes,
  isExpanded 
}) => {
  if (!selectedNode) return null;

  const getCategoryIcon = (group: GraphNode['group']) => {
    const iconProps = { className: "h-4 w-4" };
    switch (group) {
      case 'technology': return <Zap {...iconProps} />;
      case 'language': return <BookOpen {...iconProps} />;
      case 'framework': return <Circle {...iconProps} />;
      case 'tool': return <Tags {...iconProps} />;
      case 'concept': return <Users {...iconProps} />;
      default: return <Circle {...iconProps} />;
    }
  };

  const getCategoryColor = (group: GraphNode['group']) => {
    switch (group) {
      case 'technology': return 'bg-node-technology/20 text-node-technology border-node-technology/30';
      case 'language': return 'bg-node-language/20 text-node-language border-node-language/30';
      case 'framework': return 'bg-node-framework/20 text-node-framework border-node-framework/30';
      case 'tool': return 'bg-node-tool/20 text-node-tool border-node-tool/30';
      case 'concept': return 'bg-node-concept/20 text-node-concept border-node-concept/30';
      default: return 'bg-node-default/20 text-node-default border-node-default/30';
    }
  };

  return (
    <div className={`
      fixed top-0 right-0 h-full w-96 bg-card border-l border-border 
      shadow-card-elevated z-50 transform transition-transform duration-300
      ${isExpanded ? 'translate-x-0' : 'translate-x-full'}
      flex flex-col
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          {getCategoryIcon(selectedNode.group)}
          <h2 className="text-xl font-semibold text-foreground">Node Details</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Node Information */}
        <Card className="bg-graph-surface border-graph-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedNode.label}</CardTitle>
              <Badge 
                variant="outline" 
                className={`${getCategoryColor(selectedNode.group)} font-medium`}
              >
                <span className="flex items-center gap-1">
                  {getCategoryIcon(selectedNode.group)}
                  {selectedNode.group}
                </span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base leading-relaxed text-muted-foreground">
              {selectedNode.description}
            </CardDescription>
          </CardContent>
        </Card>

        {/* Node Properties */}
        <Card className="bg-graph-surface border-graph-border">
          <CardHeader>
            <CardTitle className="text-base">Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Node ID:</span>
              <span className="font-mono text-primary">{selectedNode.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Size:</span>
              <span className="font-semibold">{selectedNode.size || 10}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-semibold ${selectedNode.expanded ? 'text-node-selected' : 'text-muted-foreground'}`}>
                {selectedNode.expanded ? 'Expanded' : 'Collapsed'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Connected Nodes */}
        {connectedNodes.length > 0 && (
          <>
            <Separator className="bg-border" />
            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Connected Nodes ({connectedNodes.length})
              </h3>
              <div className="space-y-2">
                {connectedNodes.map((node) => (
                  <div 
                    key={node.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-graph-surface border border-graph-border hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(node.group)}
                      <span className="font-medium text-sm">{node.label}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getCategoryColor(node.group)} text-xs`}
                    >
                      {node.group}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Interaction Hints */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-sm space-y-2 text-muted-foreground">
              <p className="flex items-center gap-2">
                <Circle className="h-3 w-3 fill-primary text-primary" />
                Click nodes to expand connections
              </p>
              <p className="flex items-center gap-2">
                <Circle className="h-3 w-3 fill-muted text-muted" />
                Drag nodes to reposition them
              </p>
              <p className="flex items-center gap-2">
                <Circle className="h-3 w-3 fill-accent text-accent" />
                Use search to highlight nodes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sidebar;