import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Search } from "lucide-react";
import { MemberList } from "@/hooks/useMemberLists";

interface MemberListSearchSelectProps {
  lists: MemberList[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function MemberListSearchSelect({ lists, selectedIds, onSelectionChange }: MemberListSearchSelectProps) {
  const [search, setSearch] = useState("");

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

      <div className="border rounded-md bg-card max-h-60 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground p-3 text-center">Nenhuma lista encontrada</p>
        ) : (
          <>
            <label className="flex items-center gap-2 px-3 py-2 border-b cursor-pointer hover:bg-accent">
              <Checkbox checked={allFilteredSelected} onCheckedChange={handleSelectAll} />
              <span className="text-sm font-medium">Selecionar todas ({filtered.length})</span>
            </label>

            {filtered.map((l) => (
              <label
                key={l.id}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent text-sm"
              >
                <Checkbox
                  checked={selectedIds.includes(l.id)}
                  onCheckedChange={(checked) => handleToggle(l.id, !!checked)}
                />
                <span className="font-medium flex-1">{l.name}</span>
                {l.description && <span className="text-xs text-muted-foreground truncate max-w-[120px]">{l.description}</span>}
              </label>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
