import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { MemberList } from "@/hooks/useMemberLists";
import { CreateMemberListDialog } from "@/components/CreateMemberListDialog";

interface MemberListSelectorProps {
  lists: MemberList[];
  selectedListId: string | null;
  onSelectList: (listId: string | null) => void;
  onCreateList: (name: string, description?: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateList: (listId: string, name: string, description?: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteList: (listId: string) => Promise<{ success: boolean; error?: string }>;
}

export function MemberListSelector({
  lists,
  selectedListId,
  onSelectList,
  onCreateList,
  onUpdateList,
  onDeleteList,
}: MemberListSelectorProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingList, setEditingList] = useState<MemberList | null>(null);

  const selectedList = lists.find((l) => l.id === selectedListId);

  const handleEdit = () => {
    if (selectedList) {
      setEditingList(selectedList);
      setEditOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedList) return;
    if (!confirm(`Tem certeza que deseja excluir a lista "${selectedList.name}"? Os membros não serão removidos, apenas desvinculados.`)) return;
    const result = await onDeleteList(selectedList.id);
    if (result.success) {
      onSelectList(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedListId || "__all__"}
        onValueChange={(v) => onSelectList(v === "__all__" ? null : v)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Todas as listas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos os membros</SelectItem>
          {lists.map((list) => (
            <SelectItem key={list.id} value={list.id}>
              {list.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedListId && (
        <>
          <Button variant="ghost" size="icon" onClick={handleEdit} title="Editar lista">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} title="Excluir lista">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </>
      )}

      <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
        <Plus className="w-4 h-4 mr-1" />
        Nova Lista
      </Button>

      <CreateMemberListDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={onCreateList}
      />

      {editingList && (
        <CreateMemberListDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          onSubmit={(name, desc) => onUpdateList(editingList.id, name, desc)}
          editData={{ name: editingList.name, description: editingList.description }}
        />
      )}
    </div>
  );
}
