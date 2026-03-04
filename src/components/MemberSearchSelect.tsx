import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Search, Loader2 } from "lucide-react";

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

  useEffect(() => {
    async function fetchMembers() {
      if (!condominiumId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          user_id, member_id,
          profiles:user_id (id, full_name, phone),
          condo_members:member_id (id, full_name, phone)
        `)
        .eq("condominium_id", condominiumId)
        .eq("is_approved", true);

      if (error) {
        console.error("Error fetching members:", error);
        setLoading(false);
        return;
      }

      const mapped: MemberOption[] = (data || [])
        .map((role: any) => {
          const source = role.profiles || role.condo_members;
          if (!source) return null;
          const id = role.user_id || role.member_id;
          return {
            id,
            name: source.full_name || "Sem nome",
            phone: source.phone || null,
          };
        })
        .filter((m: MemberOption | null): m is MemberOption => m !== null);

      setMembers(mapped);
      setLoading(false);
    }
    fetchMembers();
  }, [condominiumId]);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || (m.phone && m.phone.includes(q));
  });

  const allFilteredSelected = filtered.length > 0 && filtered.every((m) => selectedIds.includes(m.id));

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
        <div className="flex flex-wrap gap-1.5">
          {selectedMembers.map((m) => (
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

      {/* Member list with checkboxes */}
      <div className="border rounded-md bg-card max-h-60 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-3">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground p-3 text-center">
            Nenhum membro encontrado
          </p>
        ) : (
          <>
            {/* Select all */}
            <label className="flex items-center gap-2 px-3 py-2 border-b cursor-pointer hover:bg-accent">
              <Checkbox
                checked={allFilteredSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                Selecionar todos ({filtered.length})
              </span>
            </label>

            {filtered.map((m) => (
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
