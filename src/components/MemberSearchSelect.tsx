import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search, Loader2 } from "lucide-react";

interface MemberOption {
  id: string; // user_id or member_id from user_roles
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
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = members.filter((m) => {
    if (selectedIds.includes(m.id)) return false;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || (m.phone && m.phone.includes(q));
  });

  const selectedMembers = members.filter((m) => selectedIds.includes(m.id));

  return (
    <div ref={wrapperRef} className="space-y-2 mt-2">
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
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="pl-8"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="border rounded-md bg-card max-h-48 overflow-y-auto shadow-md">
          {loading ? (
            <div className="flex items-center justify-center p-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground p-3 text-center">
              {search ? "Nenhum membro encontrado" : "Todos os membros já foram selecionados"}
            </p>
          ) : (
            filtered.slice(0, 20).map((m) => (
              <button
                key={m.id}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent text-sm flex justify-between items-center"
                onClick={() => {
                  onSelectionChange([...selectedIds, m.id]);
                  setSearch("");
                }}
              >
                <span className="font-medium">{m.name}</span>
                {m.phone && <span className="text-xs text-muted-foreground">{m.phone}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
