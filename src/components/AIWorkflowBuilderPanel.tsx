import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AIWorkflowDefinition,
  AIWorkflowNodeKind,
  AIWorkflowRunResult,
  AIWorkflowStep,
} from '../types';
import {
  Bot,
  Plus,
  Play,
  Save,
  Trash2,
  ArrowDown,
  Webhook,
  Download,
  Copy,
  Check,
  Sparkles,
  Server,
  Clock,
  CheckCircle2,
  AlertCircle,
  Workflow,
  RefreshCw,
} from 'lucide-react';

interface BackendAIStatus {
  geminiConfigured: boolean;
  activeModel: string;
  opalBridgeVersion: string;
  webhookEndpoint: string;
  webhookEventsCount: number;
}

interface InboundWebhookEvent {
  id: string;
  receivedAt: string;
  source: string;
  title: string;
  category: string;
  summary: string;
}

export const AIWorkflowBuilderPanel: React.FC = () => {
  const {
    aiWorkflows,
    saveAIWorkflow,
    deleteAIWorkflow,
    runAIWorkflow,
    recordInboundOpalEvent,
    allInstitutions,
    allFacilities,
    allBookings,
    demoRequests,
    addToast,
  } = useApp();

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(
    aiWorkflows[0]?.id || ''
  );
  const [draftWorkflow, setDraftWorkflow] = useState<AIWorkflowDefinition | null>(
    aiWorkflows[0] || null
  );
  const CONCIERGE_SAMPLE_JSON = JSON.stringify(
    {
      applicant_name: 'Sample Campus Administrator',
      institution_name: 'Sample State University (Cebu City)',
      institution_type: 'State University',
      estimated_spaces: '35 Sample Campus Spaces (Auditorium, Gymnasium, Labs & Courts)',
    },
    null,
    2
  );

  const [testInput, setTestInput] = useState<string>(CONCIERGE_SAMPLE_JSON);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<AIWorkflowRunResult | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendAIStatus | null>(null);
  const [webhookEvents, setWebhookEvents] = useState<InboundWebhookEvent[]>([]);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const selectedWorkflow = aiWorkflows.find((w) => w.id === selectedWorkflowId) || aiWorkflows[0];

  useEffect(() => {
    if (selectedWorkflow && (!draftWorkflow || draftWorkflow.id !== selectedWorkflow.id)) {
      setDraftWorkflow(JSON.parse(JSON.stringify(selectedWorkflow)));
      setRunResult(null);
    }
  }, [selectedWorkflowId, selectedWorkflow]);

  const fetchBridgeStatus = async () => {
    try {
      const [statusResp, eventsResp] = await Promise.all([
        fetch('/api/ai/status').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/webhooks/opal/events').then((r) => (r.ok ? r.json() : null)),
      ]);
      if (statusResp?.success) {
        setBackendStatus(statusResp);
      }
      if (eventsResp?.success && Array.isArray(eventsResp.events)) {
        setWebhookEvents(eventsResp.events);
      }
    } catch {
      // ignore transient network check
    }
  };

  useEffect(() => {
    fetchBridgeStatus();
  }, []);

  const handleCreateWorkflow = () => {
    const now = new Date().toISOString();
    const newWf: AIWorkflowDefinition = {
      id: `wf-${Date.now().toString(36)}`,
      name: 'Custom Campus AI Workflow',
      description: 'Multi-step Gemini prompt chain executed on the SmartSpace Express backend.',
      triggerType: 'manual',
      isActive: true,
      opalCompatibleVersion: 'opal-workflow-v1',
      createdAt: now,
      updatedAt: now,
      runCount: 0,
      steps: [
        {
          id: `step-${Date.now().toString(36)}`,
          order: 1,
          kind: 'gemini_generate',
          title: 'Analyze Facility Request Input',
          model: 'gemini-4-hydrogen',
          systemInstruction:
            'You are a SmartSpace university operations assistant. Keep outputs factual and concise.',
          promptTemplate: 'Summarize key action items from this request:\n\n{{input}}',
          outputFormat: 'text',
        },
      ],
    };
    saveAIWorkflow(newWf);
    setSelectedWorkflowId(newWf.id);
    setDraftWorkflow(JSON.parse(JSON.stringify(newWf)));
    setRunResult(null);
  };

  const handleAddStep = () => {
    if (!draftWorkflow) return;
    const nextOrder = draftWorkflow.steps.length + 1;
    const newStep: AIWorkflowStep = {
      id: `step-${Date.now().toString(36)}-${nextOrder}`,
      order: nextOrder,
      kind: 'gemini_generate',
      title: `Step ${nextOrder}: Follow-up Synthesis`,
      model: 'gemini-4-hydrogen',
      systemInstruction: 'Process the previous step output accurately for SmartSpace administrators.',
      promptTemplate:
        'Using the prior step result:\n{{prev_output}}\n\nProduce a concise 3-bullet operational summary.',
      outputFormat: 'text',
    };
    setDraftWorkflow({
      ...draftWorkflow,
      steps: [...draftWorkflow.steps, newStep],
    });
  };

  const handleUpdateStep = (stepId: string, updates: Partial<AIWorkflowStep>) => {
    if (!draftWorkflow) return;
    setDraftWorkflow({
      ...draftWorkflow,
      steps: draftWorkflow.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
    });
  };

  const handleRemoveStep = (stepId: string) => {
    if (!draftWorkflow || draftWorkflow.steps.length <= 1) {
      addToast('warning', 'Minimum Step Required', 'A workflow needs at least one AI step.');
      return;
    }
    const filtered = draftWorkflow.steps
      .filter((s) => s.id !== stepId)
      .map((s, idx) => ({ ...s, order: idx + 1 }));
    setDraftWorkflow({ ...draftWorkflow, steps: filtered });
  };

  const handleSaveDraft = () => {
    if (!draftWorkflow) return;
    saveAIWorkflow(draftWorkflow);
  };

  const handleRunDraft = async () => {
    if (!draftWorkflow) return;
    saveAIWorkflow(draftWorkflow);
    setIsRunning(true);
    setRunResult(null);
    const res = await runAIWorkflow(draftWorkflow.id, testInput);
    setRunResult(res);
    setIsRunning(false);
    fetchBridgeStatus();
  };

  const handleLoadLiveSnapshot = () => {
    const snapshot = {
      institutions: allInstitutions.length,
      facilities: allFacilities.length,
      pendingBookings: allBookings.filter((b) => b.status === 'pending').length,
      approvedBookings: allBookings.filter((b) => b.status === 'approved').length,
      demoRequests: demoRequests.map((d) => ({
        institution: d.institutionName,
        facilities: d.estimatedFacilities,
        status: d.status,
      })),
    };
    setTestInput(JSON.stringify(snapshot, null, 2));
  };

  const handleTestInboundWebhook = async () => {
    setIsTestingWebhook(true);
    try {
      const resp = await fetch('/api/webhooks/opal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Opal / Gemini Gem Bridge',
          workflowId: draftWorkflow?.id || 'wf-opal-webhook-bridge',
          title: `External Trigger: ${draftWorkflow?.name || 'Campus Readiness Sync'}`,
          category: 'Enterprise Onboarding',
          message:
            'Inbound workflow notification: 2 satellite campuses requested weekend gymnasium & laboratory availability audit.',
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.success && data.event) {
        recordInboundOpalEvent(data.event);
        await fetchBridgeStatus();
        addToast(
          'success',
          'Webhook Event Recorded',
          'Payload received on /api/webhooks/opal and queued for review.'
        );
      } else {
        addToast('error', 'Webhook Failed', data?.error || 'Could not reach webhook endpoint.');
      }
    } catch {
      addToast('error', 'Network Error', 'Failed to invoke /api/webhooks/opal.');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhooks/opal`
      : '/api/webhooks/opal';

  const handleCopyWebhook = () => {
    navigator.clipboard?.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 1800);
  };

  const handleExportWorkflowJson = () => {
    if (!draftWorkflow) return;
    const opalSpec = {
      schema: draftWorkflow.opalCompatibleVersion,
      platform: 'SmartSpace',
      webhookTarget: webhookUrl,
      workflow: draftWorkflow,
    };
    const jsonText = JSON.stringify(opalSpec, null, 2);
    navigator.clipboard?.writeText(jsonText);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
    addToast('info', 'Workflow JSON Copied', 'Opal-compatible workflow definition copied to clipboard.');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header & Architecture Transparency */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0B1528] text-white text-[10px] font-bold uppercase tracking-wider">
              <Workflow className="w-3 h-3 text-[#FDB813]" />
              <span>AI Workflow Builder &amp; Opal Bridge</span>
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                backendStatus?.geminiConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <Server className="w-3 h-3" />
              <span>
                {backendStatus?.geminiConfigured
                  ? `Backend Active · ${backendStatus.activeModel}`
                  : 'Server Ready · Configure GEMINI_API_KEY in Secrets'}
              </span>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-950">
            Visual Prompt-Chain Builder (Express + Firestore + Gemini)
          </h3>
          <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
            Google Opal graduated from Google Labs into Gemini Gems and has no hosted database runtime. This builder runs Opal-style chained Gemini steps directly on SmartSpace&apos;s Express backend (`server.ts`), persists workflows in Firestore, and exposes `/api/webhooks/opal` for external Gems or Apps Script triggers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCreateWorkflow}
            className="px-3.5 py-2 rounded-lg bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Workflow</span>
          </button>
          <button
            type="button"
            onClick={handleExportWorkflowJson}
            disabled={!draftWorkflow}
            className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
            <span>{copiedJson ? 'Copied JSON' : 'Export Workflow JSON'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Saved Workflows & Inbound Webhook Bridge */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Saved AI Workflows ({aiWorkflows.length})
            </span>
            <div className="space-y-2">
              {aiWorkflows.map((wf) => {
                const isSelected = wf.id === draftWorkflow?.id;
                return (
                  <button
                    key={wf.id}
                    type="button"
                    onClick={() => {
                      setSelectedWorkflowId(wf.id);
                      setDraftWorkflow(JSON.parse(JSON.stringify(wf)));
                      setRunResult(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                      isSelected
                        ? 'border-[#0077C8] bg-blue-50/50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{wf.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                        {wf.steps.length} step{wf.steps.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{wf.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Trigger: {wf.triggerType}</span>
                      <span>{wf.runCount} run(s)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inbound Opal / Gemini Gem Webhook Bridge Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-[#FAF9F6] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Webhook className="w-4 h-4 text-[#0077C8]" />
                <span>External Opal / Gem Webhook</span>
              </span>
              <button
                type="button"
                onClick={fetchBridgeStatus}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Refresh webhook events"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Send JSON payloads from external Google Opal exports, Gemini Gems, or Google Apps Script into SmartSpace&apos;s Express backend:
            </p>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
              <code className="text-[10px] font-mono text-slate-700 truncate flex-1">
                POST {webhookUrl}
              </code>
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="text-slate-500 hover:text-[#0077C8] cursor-pointer shrink-0"
                title="Copy webhook URL"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleTestInboundWebhook}
              disabled={isTestingWebhook}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Webhook className="w-3.5 h-3.5 text-[#0077C8]" />
              <span>{isTestingWebhook ? 'Sending Test Payload...' : 'Simulate Inbound Opal Trigger'}</span>
            </button>

            {webhookEvents.length > 0 && (
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Recent Inbound Events ({webhookEvents.length})
                </span>
                {webhookEvents.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                    <div className="font-semibold text-slate-900 truncate">{ev.title}</div>
                    <div className="text-slate-500 truncate">{ev.summary}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

          {/* Right: Step Chain Editor & Live Runner */}
        {draftWorkflow ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Workflow Metadata */}
            <div className="p-4 rounded-xl border border-slate-200 bg-[#FAF9F6] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="ai-wf-name" className="block text-[11px] font-bold text-slate-700 mb-1">
                    Workflow Name
                  </label>
                  <input
                    id="ai-wf-name"
                    type="text"
                    value={draftWorkflow.name}
                    onChange={(e) => setDraftWorkflow({ ...draftWorkflow, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0077C8]"
                  />
                </div>
                <div>
                  <label htmlFor="ai-wf-trigger" className="block text-[11px] font-bold text-slate-700 mb-1">
                    Trigger Event
                  </label>
                  <select
                    id="ai-wf-trigger"
                    value={draftWorkflow.triggerType}
                    onChange={(e) =>
                      setDraftWorkflow({
                        ...draftWorkflow,
                        triggerType: e.target.value as AIWorkflowDefinition['triggerType'],
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8]"
                  >
                    <option value="manual">Manual / On-Demand</option>
                    <option value="demo_request">New Demo Request</option>
                    <option value="booking_created">New Facility Booking</option>
                    <option value="opal_webhook">External Opal Webhook</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="ai-wf-description" className="block text-[11px] font-bold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  id="ai-wf-description"
                  type="text"
                  value={draftWorkflow.description}
                  onChange={(e) =>
                    setDraftWorkflow({ ...draftWorkflow, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0077C8]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-[11px] text-slate-600">
                  Use <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">{'{{input}}'}</code>,{' '}
                  <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">{'{{prev_output}}'}</code>, or JSON keys like{' '}
                  <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">{'{{applicant_name}}'}</code> &amp;{' '}
                  <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">{'{{institution_name}}'}</code>.
                </div>
                <div className="flex items-center gap-2">
                  {aiWorkflows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteAIWorkflow(draftWorkflow.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-3 py-1.5 rounded-lg bg-[#0B1528] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Save Workflow</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Chained Steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Prompt Chain Nodes ({draftWorkflow.steps.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[#005A9C] font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add Node Step</span>
                </button>
              </div>

              {draftWorkflow.steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <span className="w-6 h-6 rounded-md bg-[#0077C8] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          aria-label={`Step ${index + 1} title`}
                          value={step.title}
                          onChange={(e) => handleUpdateStep(step.id, { title: e.target.value })}
                          className="text-xs font-bold text-slate-900 bg-transparent border-b border-transparent focus:border-[#0077C8] focus:outline-none w-full"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          aria-label={`Step ${index + 1} kind`}
                          value={step.kind}
                          onChange={(e) =>
                            handleUpdateStep(step.id, { kind: e.target.value as AIWorkflowNodeKind })
                          }
                          className="px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium"
                        >
                          <option value="structured_extract">Structured JSON Extract</option>
                          <option value="gemini_generate">Gemini Text Generate</option>
                          <option value="dispatch_action">Dispatch Composer</option>
                        </select>

                        <select
                          aria-label={`Step ${index + 1} model`}
                          value={step.model}
                          onChange={(e) =>
                            handleUpdateStep(step.id, {
                              model: e.target.value as AIWorkflowStep['model'],
                            })
                          }
                          className="px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-mono"
                        >
                          <option value="gemini-4-hydrogen">gemini-4-hydrogen</option>
                          <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveStep(step.id)}
                          aria-label={`Remove step ${index + 1}`}
                          className="p-1 text-slate-600 hover:text-red-700 cursor-pointer"
                          title="Remove step"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      <div>
                        <label htmlFor={`ai-step-sys-${step.id}`} className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          System Instruction
                        </label>
                        <input
                          id={`ai-step-sys-${step.id}`}
                          type="text"
                          value={step.systemInstruction || ''}
                          onChange={(e) =>
                            handleUpdateStep(step.id, { systemInstruction: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label htmlFor={`ai-step-prompt-${step.id}`} className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Prompt Template
                        </label>
                        <textarea
                          id={`ai-step-prompt-${step.id}`}
                          rows={2}
                          value={step.promptTemplate}
                          onChange={(e) =>
                            handleUpdateStep(step.id, { promptTemplate: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {index < draftWorkflow.steps.length - 1 && (
                    <div className="flex justify-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500 border border-slate-200">
                        <ArrowDown className="w-3 h-3 text-[#0077C8]" />
                        <span>passes {'{{prev_output}}'}</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Live Server-Side Test Runner */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0077C8]" />
                  <span>Live Backend Runner (/api/ai/run-workflow)</span>
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTestInput(CONCIERGE_SAMPLE_JSON)}
                    className="text-[11px] font-semibold text-[#0077C8] hover:underline cursor-pointer"
                  >
                    Load Concierge Sample (CTU Main)
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadLiveSnapshot}
                    className="text-[11px] font-semibold text-[#0077C8] hover:underline cursor-pointer"
                  >
                    Load Live SmartSpace Data Snapshot
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter test input payload ({{input}})..."
                className="w-full p-2.5 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C8]"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleRunDraft}
                  disabled={isRunning}
                  className="px-4 py-2 rounded-lg bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isRunning ? 'Executing Gemini Chain...' : 'Run Workflow on Backend'}</span>
                </button>
              </div>

              {runResult && (
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    runResult.success
                      ? 'bg-white border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5 text-slate-900">
                      {runResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>
                        {runResult.success
                          ? `Completed ${runResult.traces.length} Step(s)`
                          : 'Workflow Execution Error'}
                      </span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{runResult.totalDurationMs}ms</span>
                    </span>
                  </div>

                  {runResult.error && (
                    <p className="text-xs text-red-700 font-medium">{runResult.error}</p>
                  )}

                  {runResult.traces.map((tr, idx) => (
                    <div
                      key={tr.stepId + idx}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">
                          Step {idx + 1}: {tr.title}
                        </span>
                        <span className="font-mono text-slate-500">
                          {tr.model} · {tr.durationMs}ms
                        </span>
                      </div>
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {tr.output}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
            Select or create an AI workflow to start building.
          </div>
        )}
      </div>
    </div>
  );
};
