// Knowledge Graph Data Structure
// Sample data representing a web development technology ecosystem

export interface GraphNode {
  id: string;
  label: string;
  group: 'technology' | 'language' | 'framework' | 'tool' | 'concept';
  description: string;
  size?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  expanded?: boolean;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
  strength?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Initial knowledge graph data
export const initialGraphData: GraphData = {
  nodes: [
    {
      id: 'react',
      label: 'React',
      group: 'framework',
      description: 'A JavaScript library for building user interfaces with component-based architecture.',
      size: 20
    },
    {
      id: 'typescript',
      label: 'TypeScript',
      group: 'language',
      description: 'A strongly typed programming language that builds on JavaScript by adding static type definitions.',
      size: 18
    },
    {
      id: 'javascript',
      label: 'JavaScript',
      group: 'language',
      description: 'A high-level, interpreted programming language that is widely used for web development.',
      size: 22
    },
    {
      id: 'd3js',
      label: 'D3.js',
      group: 'framework',
      description: 'A JavaScript library for producing dynamic, interactive data visualizations in web browsers.',
      size: 16
    },
    {
      id: 'vite',
      label: 'Vite',
      group: 'tool',
      description: 'A fast build tool and development server for modern web projects.',
      size: 14
    },
    {
      id: 'tailwind',
      label: 'Tailwind CSS',
      group: 'framework',
      description: 'A utility-first CSS framework for rapidly building custom user interfaces.',
      size: 15
    },
    {
      id: 'nodejs',
      label: 'Node.js',
      group: 'technology',
      description: 'A JavaScript runtime built on Chrome\'s V8 JavaScript engine for server-side development.',
      size: 19
    },
    {
      id: 'visualization',
      label: 'Data Visualization',
      group: 'concept',
      description: 'The graphical representation of information and data using visual elements.',
      size: 17
    }
  ],
  links: [
    { source: 'react', target: 'javascript', relation: 'built-with', strength: 1 },
    { source: 'react', target: 'typescript', relation: 'supports', strength: 0.8 },
    { source: 'typescript', target: 'javascript', relation: 'extends', strength: 1 },
    { source: 'd3js', target: 'javascript', relation: 'built-with', strength: 1 },
    { source: 'd3js', target: 'visualization', relation: 'enables', strength: 1 },
    { source: 'vite', target: 'react', relation: 'builds', strength: 0.9 },
    { source: 'tailwind', target: 'react', relation: 'styles', strength: 0.7 },
    { source: 'nodejs', target: 'javascript', relation: 'runs', strength: 1 },
    { source: 'vite', target: 'nodejs', relation: 'requires', strength: 0.6 }
  ]
};

// Expanded node data for dynamic loading
export const expandedNodes: Record<string, GraphNode[]> = {
  react: [
    {
      id: 'jsx',
      label: 'JSX',
      group: 'language',
      description: 'A syntax extension to JavaScript used with React to describe UI elements.',
      size: 12
    },
    {
      id: 'hooks',
      label: 'React Hooks',
      group: 'concept',
      description: 'Functions that let you use state and other React features in functional components.',
      size: 14
    },
    {
      id: 'redux',
      label: 'Redux',
      group: 'framework',
      description: 'A predictable state container for JavaScript applications.',
      size: 13
    }
  ],
  d3js: [
    {
      id: 'svg',
      label: 'SVG',
      group: 'technology',
      description: 'Scalable Vector Graphics for creating vector-based graphics in web browsers.',
      size: 11
    },
    {
      id: 'canvas',
      label: 'HTML5 Canvas',
      group: 'technology',
      description: 'An HTML element used to draw graphics on the fly via JavaScript.',
      size: 10
    }
  ],
  javascript: [
    {
      id: 'es6',
      label: 'ES6+',
      group: 'concept',
      description: 'Modern JavaScript features including arrow functions, classes, and modules.',
      size: 13
    },
    {
      id: 'webpack',
      label: 'Webpack',
      group: 'tool',
      description: 'A static module bundler for modern JavaScript applications.',
      size: 12
    }
  ],
  nodejs: [
    {
      id: 'npm',
      label: 'NPM',
      group: 'tool',
      description: 'Node Package Manager for JavaScript, the world\'s largest software registry.',
      size: 15
    },
    {
      id: 'express',
      label: 'Express.js',
      group: 'framework',
      description: 'A minimal and flexible Node.js web application framework.',
      size: 14
    }
  ]
};

// Expanded links for dynamic loading
export const expandedLinks: Record<string, GraphLink[]> = {
  react: [
    { source: 'react', target: 'jsx', relation: 'uses', strength: 1 },
    { source: 'react', target: 'hooks', relation: 'includes', strength: 1 },
    { source: 'redux', target: 'react', relation: 'manages-state', strength: 0.8 }
  ],
  d3js: [
    { source: 'd3js', target: 'svg', relation: 'renders-to', strength: 0.9 },
    { source: 'd3js', target: 'canvas', relation: 'renders-to', strength: 0.7 }
  ],
  javascript: [
    { source: 'javascript', target: 'es6', relation: 'includes', strength: 1 },
    { source: 'webpack', target: 'javascript', relation: 'bundles', strength: 0.9 }
  ],
  nodejs: [
    { source: 'nodejs', target: 'npm', relation: 'includes', strength: 1 },
    { source: 'express', target: 'nodejs', relation: 'runs-on', strength: 1 }
  ]
};

// Node color mapping for consistency
export const getNodeColor = (group: GraphNode['group']): string => {
  const colors = {
    technology: 'hsl(var(--node-technology))',
    language: 'hsl(var(--node-language))',
    framework: 'hsl(var(--node-framework))',
    tool: 'hsl(var(--node-tool))',
    concept: 'hsl(var(--node-concept))'
  };
  return colors[group] || 'hsl(var(--node-default))';
};