import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Pipeline {
  id: string;
  condominium_id: string;
  name: string;
  lead_type: "property" | "broker";
  is_default: boolean;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  color: string | null;
  sla_days: number | null;
  is_terminal: boolean;
}

export interface Property {
  id: string;
  condominium_id: string;
  owner_member_id: string | null;
  listing_agent_member_id: string | null;
  stage_id: string | null;
  code: string | null;
  title: string;
  property_type: string | null;
  status: string;
  transaction_type: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  price: number | null;
  condo_fee: number | null;
  iptu: number | null;
  area_m2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  description: string | null;
  photos: any;
  metadata: any;
  captured_at: string | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaptureLead {
  id: string;
  condominium_id: string;
  lead_type: "property" | "broker";
  full_name: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  stage_id: string | null;
  assigned_to_profile_id: string | null;
  notes: string | null;
  metadata: any;
  converted_at: string | null;
  converted_to_id: string | null;
  converted_to_type: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  condominium_id: string;
  entity_type: string | null;
  entity_id: string | null;
  assigned_to_profile_id: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  completed_at: string | null;
  status: "open" | "in_progress" | "done" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  condominium_id: string;
  entity_type: "property" | "lead" | "member";
  entity_id: string;
  channel: "whatsapp" | "sms" | "email" | "call" | "visit" | "note" | "system";
  direction: "outbound" | "inbound" | "internal" | null;
  subject: string | null;
  content: string | null;
  metadata: any;
  created_by: string | null;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  condominium_id: string;
  channel: "whatsapp" | "sms" | "email";
  name: string;
  subject: string | null;
  body: string;
  variables: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ----- Pipelines -----
export function usePipelines(condoId: string | undefined) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!condoId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: pipes } = await supabase
      .from("pipelines")
      .select("*")
      .eq("condominium_id", condoId)
      .order("created_at");
    const pipeIds = (pipes || []).map((p) => p.id);
    let stageData: PipelineStage[] = [];
    if (pipeIds.length > 0) {
      const { data } = await supabase
        .from("pipeline_stages")
        .select("*")
        .in("pipeline_id", pipeIds)
        .order("position");
      stageData = data || [];
    }
    setPipelines((pipes || []) as Pipeline[]);
    setStages(stageData);
    setLoading(false);
  }, [condoId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { pipelines, stages, loading, refetch };
}

// ----- Properties -----
export function useProperties(condoId: string | undefined) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!condoId) return;
    setLoading(true);
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("condominium_id", condoId)
      .order("created_at", { ascending: false });
    setProperties((data || []) as Property[]);
    setLoading(false);
  }, [condoId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { properties, loading, refetch };
}

// ----- Leads -----
export function useCaptureLeads(condoId: string | undefined, leadType?: "property" | "broker") {
  const [leads, setLeads] = useState<CaptureLead[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!condoId) return;
    setLoading(true);
    let q = supabase.from("capture_leads").select("*").eq("condominium_id", condoId);
    if (leadType) q = q.eq("lead_type", leadType);
    const { data } = await q.order("created_at", { ascending: false });
    setLeads((data || []) as CaptureLead[]);
    setLoading(false);
  }, [condoId, leadType]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { leads, loading, refetch };
}

// ----- Tasks -----
export function useTasks(condoId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!condoId) return;
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("condominium_id", condoId)
      .order("due_at", { ascending: true, nullsFirst: false });
    setTasks((data || []) as Task[]);
    setLoading(false);
  }, [condoId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tasks, loading, refetch };
}

// ----- Interactions -----
export function useInteractions(
  condoId: string | undefined,
  entityType?: "property" | "lead" | "member",
  entityId?: string
) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!condoId) return;
    setLoading(true);
    let q = supabase.from("interactions").select("*").eq("condominium_id", condoId);
    if (entityType) q = q.eq("entity_type", entityType);
    if (entityId) q = q.eq("entity_id", entityId);
    const { data } = await q.order("created_at", { ascending: false }).limit(200);
    setInteractions((data || []) as Interaction[]);
    setLoading(false);
  }, [condoId, entityType, entityId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { interactions, loading, refetch };
}

// ----- Templates -----
export function useMessageTemplates(condoId: string | undefined) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!condoId) return;
    setLoading(true);
    const { data } = await supabase
      .from("message_templates")
      .select("*")
      .eq("condominium_id", condoId)
      .order("created_at", { ascending: false });
    setTemplates((data || []) as MessageTemplate[]);
    setLoading(false);
  }, [condoId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { templates, loading, refetch };
}
