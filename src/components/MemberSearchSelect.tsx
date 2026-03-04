import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const BATCH_SIZE = 50;

interface MemberOption {
  id: string;
  name: string;
  phone: string | null;
}

interface MemberSearchSelectProps {
  condominiumId: string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function MemberSearchSelect({ condominiumId, selectedIds, onSelectionChange }: MemberSearchSelectProps) {
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchPage, setBatchPage] = useState(0);

  useEffect(() => {
    async function fetchMembers() {
      if (!condominiumId) return;
      setLoading(true);

      try {
        // Step 1: Fetch roles via RPC (bypasses per-row RLS)
        const batchSize = 1000;
        const allRoles: any[] = [];
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase.rpc('get_condominium_user_roles', {
            _condominium_id: condominiumId,
            _limit: batchSize,
            _offset: offset,
          });
          if (error) { console.error("Error fetching roles:", error); break; }
          allRoles.push(...(data || []));
          hasMore = (data?.length || 0) === batchSize;
          offset += batchSize;
        }

        // Filter approved only
        const approvedRoles = allRoles.filter((r: any) => r.is_approved);

        // Step 2: Batch-fetch condo_members via RPC
        const memberIds = [...new Set(approvedRoles.filter((r: any) => r.member_id).map((r: any) => r.member_id as string))];
        const condoMembersMap = new Map<string, any>();
        for (let i = 0; i < memberIds.length; i += batchSize) {
          const batch = memberIds.slice(i, i + batchSize);
          const { data } = await supabase.rpc('get_condo_members_by_ids', { _member_ids: batch });
          (data || []).forEach((cm: any) => condoMembersMap.set(cm.id, cm));
        }

        // Step 3: Batch-fetch profiles
        const userIds = [...new Set(approvedRoles.filter((r: any) => r.user_id).map((r: any) => r.user_id as string))];
        const profilesMap = new Map<string, any>();
        for (let i = 0; i < userIds.length; i += batchSize) {
          const batch = userIds.slice(i, i + batchSize);
          const { data } = await supabase.from("profiles").select("id, full_name, phone").in("id", batch);
          (data || []).forEach((p: any) => profilesMap.set(p.id, p));
        }

        // Step 4: Merge
        const mapped: MemberOption[] = approvedRoles
          .map((role: any) => {
            const source = role.user_id ? profilesMap.get(role.user_id) : condoMembersMap.get(role.member_id);
            if (!source) return null;
            const id = role.user_id || role.member_id;
            return { id, name: source.full_name || "Sem nome", phone: source.phone || null };
          })
          .filter((m: MemberOption | null): m is MemberOption => m !== null);

        setMembers(mapped);
      } catch (err) {
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [condominiumId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.name.toLowerCase().includes(q) || (m.phone && m.phone.includes(q)));
  }, [members, search]);

  // Reset batch page when search changes
  useEffect(() => { setBatchPage(0); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / BATCH_SIZE));
  const batchStart = batchPage * BATCH_SIZE;
  const batchEnd = Math.min(batchStart + BATCH_SIZE, filtered.length);
  const batchMembers = filtered.slice(batchStart, batchEnd);

  const allFilteredSelected = filtered.length > 0 && filtered.every((m) => selectedIds.includes(m.id));
  const batchAllSelected = batchMembers.length > 0 && batchMembers.every((m) => selectedIds.includes(m.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newIds = new Set(selectedIds);
      filtered.forEach((m) => newIds.add(m.id));
      onSelectionChange(Array.from(newIds));
    } else {
      const filteredIds = new Set(filtered.map((m) => m.id));
      onSelectionChange(selectedIds.filter((id) => !filteredIds.has(id)));
    }
  };

  const handleSelectBatch = (checked: boolean) => {
    if (checked) {
      const newIds = new Set(selectedIds);
      batchMembers.forEach((m) => newIds.add(m.id));
      onSelectionChange(Array.from(newIds));
    } else {
      const batchIds = new Set(batchMembers.map((m) => m.id));
      onSelectionChange(selectedIds.filter((id) => !batchIds.has(id)));
    }
  };

  const handleToggle = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    }
  };

  const selectedMembers = members.filter((m) => selectedIds.includes(m.id));

  return (
    <div className="space-y-2 mt-2">
      {/* Selected badges */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {selectedMembers.slice(0, 10).map((m) => (
            <Badge key={m.id} variant="secondary" className="gap-1 pr-1">
              {m.name}
              <button
                type="button"
                onClick={() => onSelectionChange(selectedIds.filter((id) => id !== m.id))}
                className="ml-0.5 rounded-full hover:bg-muted p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedMembers.length > 10 && (
            <span className="text-xs text-muted-foreground">+{selectedMembers.length - 10} mais</span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">({selectedMembers.length} selecionados)</span>
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Member list */}
      <div className="border rounded-md bg-card max-h-72 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-3">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground p-3 text-center">Nenhum membro encontrado</p>
        ) : (
          <>
            {/* Select all */}
            <label className="flex items-center gap-2 px-3 py-2 border-b cursor-pointer hover:bg-accent">
              <Checkbox checked={allFilteredSelected} onCheckedChange={handleSelectAll} />
              <span className="text-sm font-medium">Selecionar todos ({filtered.length})</span>
            </label>

            {/* Batch select + navigation */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30">
                <Checkbox checked={batchAllSelected} onCheckedChange={handleSelectBatch} />
                <span className="text-sm font-medium flex-1">
                  Selecionar lote ({batchStart + 1}-{batchEnd})
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={batchPage === 0}
                    onClick={() => setBatchPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {batchPage + 1}/{totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={batchPage >= totalPages - 1}
                    onClick={() => setBatchPage((p) => p + 1)}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Members in current batch */}
            {batchMembers.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent text-sm"
              >
                <Checkbox
                  checked={selectedIds.includes(m.id)}
                  onCheckedChange={(checked) => handleToggle(m.id, !!checked)}
                />
                <span className="font-medium flex-1">{m.name}</span>
                {m.phone && <span className="text-xs text-muted-foreground">{m.phone}</span>}
              </label>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
