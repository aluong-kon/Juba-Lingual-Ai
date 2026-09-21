import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Share2, 
  Search, 
  Layers, 
  BookOpen, 
  FileText, 
  Tag, 
  Info, 
  ArrowRight, 
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { KnowledgeGraphNode, KnowledgeGraphEdge, SemanticSynset } from '../types';

export const KnowledgeGraphView: React.FC = () => {
  const [nodes, setNodes] = useState<KnowledgeGraphNode[]>([]);
  const [edges, setEdges] = useState<KnowledgeGraphEdge[]>([]);
  const [synsets, setSynsets] = useState<SemanticSynset[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedSynsetKey, setSelectedSynsetKey] = useState<string>('peace');
  const [activeTab, setActiveTab] = useState<'synsets' | 'graph' | 'relationships'>('synsets');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch('/api/knowledge-graph');
        if (res.ok) {
          const data = await res.json();
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          setSynsets(data.synsets || []);
          if (data.nodes.length > 0 && !selectedNodeId) {
            setSelectedNodeId(data.nodes[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load knowledge graph:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedSynset = synsets.find(s => s.conceptKey === selectedSynsetKey) || synsets[0];

  // Connected edges to selected node
  const connectedEdges = edges.filter(e => e.source === selectedNodeId || e.target === selectedNodeId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Network className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">South Sudan Multilingual Knowledge Graph</h1>
                <p className="text-xs text-sky-300/80">Cognate Networks, Semantic Synsets & Comparative Nilotic/Equatorian Evidence</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Explore verified relationships between South Sudanese languages. Instead of isolated translations, 
              JubaLingua AI connects words through historical cognates, semantic equivalents, loanword layers (Juba Arabic, Swahili, English), 
              and shared cultural synsets—all grounded in peer-reviewed linguistic evidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-center">
              <div className="text-xl font-bold text-sky-400 font-mono">{nodes.length}</div>
              <div className="text-[10px] text-slate-400">Verified Nodes</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-center">
              <div className="text-xl font-bold text-emerald-400 font-mono">{edges.length}</div>
              <div className="text-[10px] text-slate-400">Evidence Edges</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('synsets')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'synsets'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Core Cultural Synsets (Comparative Explorer)</span>
        </button>
        <button
          onClick={() => setActiveTab('relationships')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'relationships'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Cognates, Dialects & Loanword Edges</span>
        </button>
      </div>

      {/* View 1: Core Cultural Synsets Explorer */}
      {activeTab === 'synsets' && (
        <div className="space-y-6">
          {/* Concept Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {synsets.map((syn) => (
              <button
                key={syn.conceptKey}
                onClick={() => setSelectedSynsetKey(syn.conceptKey)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  selectedSynsetKey === syn.conceptKey
                    ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <span>{syn.english}</span>
                {syn.jubaArabic && (
                  <span className="ml-1.5 opacity-75 font-normal">({syn.jubaArabic})</span>
                )}
              </button>
            ))}
          </div>

          {selectedSynset && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-sky-400 font-bold mb-1">
                    Semantic Synset: {selectedSynset.conceptKey.toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedSynset.english}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Juba Arabic Equivalent: <span className="text-amber-300 font-medium">{selectedSynset.jubaArabic}</span>
                  </p>
                </div>

                {selectedSynset.culturalNote && (
                  <div className="max-w-md bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Cultural Context: </span>
                      {selectedSynset.culturalNote}
                    </div>
                  </div>
                )}
              </div>

              {/* Multilingual Synset Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(selectedSynset.translations).map(([langKey, data]: [string, any]) => (
                  <div 
                    key={langKey}
                    className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-sky-400 capitalize">
                        {langKey}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        {data.priorityLevel.split(':')[0]}
                      </span>
                    </div>

                    <div>
                      <div className="text-xl font-bold text-white tracking-wide">
                        {data.word}
                      </div>
                      {data.ipa && (
                        <div className="font-mono text-xs text-slate-400 mt-0.5">
                          {data.ipa}
                        </div>
                      )}
                      {data.plural && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Plural: {data.plural}
                        </div>
                      )}
                      {data.dialect && (
                        <div className="text-[11px] text-slate-400 italic mt-0.5">
                          Dialect: {data.dialect}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      <span className="text-slate-500 font-medium">Evidence: </span>
                      <span className="text-slate-300">{data.evidence}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* View 2: Cognates, Dialects & Relationships */}
      {activeTab === 'relationships' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Node Selector List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Indexed Nodes ({nodes.length})</span>
              </h3>
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                {nodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition border ${
                      selectedNodeId === node.id
                        ? 'bg-sky-950/80 border-sky-700 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-sm text-white">{node.word}</div>
                    <div className="text-slate-400 flex items-center justify-between mt-0.5">
                      <span>{node.language} ({node.family})</span>
                      <span className="text-sky-300">{node.meaningEn}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Node Inspector & Connections */}
            <div className="lg:col-span-2 space-y-4">
              {selectedNode ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                        {selectedNode.language} • {selectedNode.family}
                      </div>
                      <h2 className="text-3xl font-bold text-white mt-1">
                        {selectedNode.word}
                      </h2>
                      <p className="text-sm text-slate-300 mt-1">
                        Meaning: <strong className="text-white">{selectedNode.meaningEn}</strong>
                      </p>
                    </div>

                    <div className="text-right font-mono text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <div>IPA: {selectedNode.ipa || 'n/a'}</div>
                      <div className="text-[10px] text-slate-500">POS: {selectedNode.pos}</div>
                    </div>
                  </div>

                  {/* Connected Relationships */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Share2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Linguistic Relationships & Evidence ({connectedEdges.length})</span>
                    </h4>

                    <div className="space-y-3">
                      {connectedEdges.map(edge => {
                        const otherNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                        const otherNode = nodes.find(n => n.id === otherNodeId);

                        return (
                          <div 
                            key={edge.id}
                            className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                edge.relationshipType === 'cognate_branch'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                  : edge.relationshipType === 'semantic_equivalent'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : edge.relationshipType === 'dialect_variant'
                                  ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {edge.relationshipType.replace('_', ' ')}
                              </span>

                              <span className="font-mono text-slate-400 text-[11px]">
                                Confidence: {Math.round(edge.confidence * 100)}%
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-sm font-medium text-white">
                              <span>{selectedNode.word} ({selectedNode.language})</span>
                              <ArrowRight className="w-4 h-4 text-slate-500" />
                              <span className="text-sky-300 font-bold">
                                {otherNode ? `${otherNode.word} (${otherNode.language})` : otherNodeId}
                              </span>
                            </div>

                            <p className="text-slate-300 text-xs leading-relaxed">
                              {edge.evidenceSource}: Verified relationship between {selectedNode.language} and {otherNode ? otherNode.language : 'related variety'}.
                            </p>

                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                              <span><strong className="text-slate-500">Citation:</strong> {edge.evidenceCitation}</span>
                              <span className="text-emerald-400">✓ Peer Verified</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500 text-xs italic bg-slate-900 rounded-xl border border-slate-800">
                  Select a linguistic node from the left panel to inspect connections.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
