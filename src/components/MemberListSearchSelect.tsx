import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, Search, ChevronDown, ChevronRight, Loader2, ChevronLeft } from "lucide-react";
import { MemberList } from "@/hooks/useMemberLists";

const BATCH_SIZE = 50;

interface MemberOption {
  id: string;
  name: string;
  phone: string | null;
}

interface MemberListSearchSelectProps {
  lists: MemberList[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  condominiumId: string;
  selectedListMemberIds: string[];
  onListMemberSelectionChange: (ids: string[]) => void;
}

interface ExpandedListState {
  members: MemberOption[];
  loading: boolean;
  search: string;
  batchPage: number;
}

export function MemberListSearchSelect({
  lists,
  selectedIds,
  onSelectionChange,
  condominiumId,
  selectedListMemberIds,
  onListMemberSelectionChange,
}: MemberListSearchSelectProps) {
  const [search, setSearch] = useState("");
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [expandedState, setExpandedState] = useState<ExpandedListState>({
    members: [],
    loading: false,
    search: "",
    batchPage: 0,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return lists;
    return lists.filter((l) => l.name.toLowerCase().includes(q));
  }, [lists, search]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((l) => selectedIds.includes(l.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newIds = new Set(selectedIds);
      filtered.forEach((l) => newIds.add(l.id));
      onSelectionChange(Array.from(newIds));
    } else {
      const filteredIds = new Set(filtered.map((l) => l.id));
      onSelectionChange(selectedIds.filter((id) => !filteredIds.has(id)));
    }
  };

  const handleToggle = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    }
  };

  // Load members when a list is expanded
  useEffect(() => {
    if (!expandedListId) return;

    const loadMembers = async () => {
      setExpandedState((s) => ({ ...s, loading: true, members: [], search: "", batchPage: 0 }));

      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          member_id,
          condo_members:member_id (id, full_name, phone)
        `)
        .eq("condominium_id", condominiumId)
        .eq("list_id", expandedListId)
        .eq("is_approved", true)
        .not("member_id", "is", null);

      if (error) {
        console.error("Error loading list members:", error);
        setExpandedState((s) => ({ ...s, loading: false }));
        return;
      }

      const mapped: MemberOption[] = (data || [])
        .map((role: any) => {
          const src = role.condo_members;
          if (!src) return null;
          return { id: src.id, name: src.full_name || "Sem nome", phone: src.phone || null };
        })
        .filter((m: MemberOption | null): m is MemberOption => m !== null);

      setExpandedState((s) => ({ ...s, members: mapped, loading: false }));
    };

    loadMembers();
  }, [expandedListId, condominiumId]);

  const toggleExpand = (listId: string) => {
    setExpandedListId((prev) => (prev === listId ? null : listId));
  };

  // Expanded list filtering & batching
  const filteredMembers = useMemo(() => {
    const q = expandedState.search.toLowerCase();
    if (!q) return expandedState.members;
    return expandedState.members.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.phone && m.phone.includes(q))
    );
  }, [expandedState.members, expandedState.search]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / BATCH_SIZE));
  const batchStart = expandedState.batchPage * BATCH_SIZE;
  const batchEnd = Math.min(batchStart + BATCH_SIZE, filteredMembers.length);
  const batchMembers = filteredMembers.slice(batchStart, batchEnd);

  const allMembersSelected = filteredMembers.length > 0 && filteredMembers.every((m) => selectedListMemberIds.includes(m.id));
  const batchAllSelected = batchMembers.length > 0 && batchMembers.every((m) => selectedListMemberIds.includes(m.id));

  const handleMemberSelectAll = (checked: boolean) => {
    if (checked) {
      const newIds = new Set(selectedListMemberIds);
      filteredMembers.forEach((m) => newIds.add(m.id));
      onListMemberSelectionChange(Array.from(newIds));
    } else {
      const ids = new Set(filteredMembers.map((m) => m.id));
      onListMemberSelectionChange(selectedListMemberIds.filter((id) => !ids.has(id)));
    }
  };

  const handleMemberBatchSelect = (checked: boolean) => {
    if (checked) {
      const newIds = new Set(selectedListMemberIds);
      batchMembers.forEach((m) => newIds.add(m.id));
      onListMemberSelectionChange(Array.from(newIds));
    } else {
      const ids = new Set(batchMembers.map((m) => m.id));
      onListMemberSelectionChange(selectedListMemberIds.filter((id) => !ids.has(id)));
    }
  };

  const handleMemberToggle = (id: string, checked: boolean) => {
    if (checked) {
      onListMemberSelectionChange([...selectedListMemberIds, id]);
    } else {
      onListMemberSelectionChange(selectedListMemberIds.filter((i) => i !== id));
    }
  };

  const selectedLists = lists.filter((l) => selectedIds.includes(l.id));

  return (
    <div className="space-y-2 mt-2">
      {selectedLists.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {selectedLists.map((l) => (
            <Badge key={l.id} variant="secondary" className="gap-1 pr-1">
              {l.name}
              <button
                type="button"
                onClick={() => onSelectionChange(selectedIds.filter((id) => id !== l.id))}
                className="ml-0.5 rounded-full hover:bg-muted p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">({selectedLists.length} selecionadas)</span>
        </div>
      )}

      {lists.length > 5 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar lista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      <div className="border rounded-md bg-card max-h-[400px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground p-3 text-center">Nenhuma lista encontrada</p>
        ) : (
          <>
            <label className="flex items-center gap-2 px-3 py-2 border-b cursor-pointer hover:bg-accent">
              <Checkbox checked={allFilteredSelected} onCheckedChange={handleSelectAll} />
              <span className="text-sm font-medium">Selecionar todas ({filtered.length})</span>
            </label>

            {filtered.map((l) => (
              <div key={l.id}>
                <div className="flex items-center gap-2 px-3 py-2 hover:bg-accent text-sm">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <Checkbox
                      checked={selectedIds.includes(l.id)}
                      onCheckedChange={(checked) => handleToggle(l.id, !!checked)}
                    />
                    <span className="font-medium flex-1">{l.name}</span>
                    {l.description && (
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">{l.description}</span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleExpand(l.id)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground"
                    title="Expandir membros"
                  >
                    {expandedListId === l.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Expanded member list */}
                {expandedListId === l.id && (
                  <div className="ml-6 mr-2 mb-2 border rounded-md bg-muted/20">
                    {expandedState.loading ? (
                      <div className="flex items-center justify-center p-3">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : expandedState.members.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-3 text-center">Nenhum membro nesta lista</p>
                    ) : (
                      <>
                        {/* Search within list */}
                        {expandedState.members.length > 10 && (
                          <div className="relative p-2 pb-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input
                              placeholder="Buscar membro..."
                              value={expandedState.search}
                              onChange={(e) =>
                                setExpandedState((s) => ({ ...s, search: e.target.value, batchPage: 0 }))
                              }
                              className="pl-8 h-8 text-xs"
                            />
                          </div>
                        )}

                        {/* Select all in this list */}
                        <label className="flex items-center gap-2 px-3 py-1.5 border-b cursor-pointer hover:bg-accent text-xs">
                          <Checkbox checked={allMembersSelected} onCheckedChange={handleMemberSelectAll} />
                          <span className="font-medium">Selecionar todos ({filteredMembers.length})</span>
                        </label>

                        {/* Batch navigation */}
                        {totalPages > 1 && (
                          <div className="flex items-center gap-2 px-3 py-1 border-b bg-muted/30 text-xs">
                            <Checkbox checked={batchAllSelected} onCheckedChange={handleMemberBatchSelect} />
                            <span className="font-medium flex-1">
                              Selecionar lote ({batchStart + 1}-{batchEnd})
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                disabled={expandedState.batchPage === 0}
                                onClick={() =>
                                  setExpandedState((s) => ({ ...s, batchPage: s.batchPage - 1 }))
                                }
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </Button>
                              <span className="text-muted-foreground whitespace-nowrap">
                                {expandedState.batchPage + 1}/{totalPages}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                disabled={expandedState.batchPage >= totalPages - 1}
                                onClick={() =>
                                  setExpandedState((s) => ({ ...s, batchPage: s.batchPage + 1 }))
                                }
                              >
                                <ChevronRight className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Individual members */}
                        {batchMembers.map((m) => (
                          <label
                            key={m.id}
                            className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-accent text-xs"
                          >
                            <Checkbox
                              checked={selectedListMemberIds.includes(m.id)}
                              onCheckedChange={(checked) => handleMemberToggle(m.id, !!checked)}
                            />
                            <span className="font-medium flex-1">{m.name}</span>
                            {m.phone && (
                              <span className="text-muted-foreground">{m.phone}</span>
                            )}
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
