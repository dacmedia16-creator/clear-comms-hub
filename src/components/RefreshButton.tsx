import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface RefreshButtonProps {
  variant?: "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}

export function RefreshButton({ 
  variant = "ghost", 
  size = "icon" 
}: RefreshButtonProps) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Limpar todo o cache do React Query
    await queryClient.invalidateQueries();
    queryClient.clear();
    
    toast({
      title: "Atualizando...",
      description: "Recarregando dados do sistema",
    });
    
    // Recarregar a pagina apos breve delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleRefresh}
      disabled={refreshing}
      title="Atualizar sistema"
    >
      <RefreshCcw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
    </Button>
  );
}
