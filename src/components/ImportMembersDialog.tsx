import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn, validateLocationOptional, formatBlock } from "@/lib/utils";
import { 
  OrganizationTerms, 
  OrganizationBehavior,
  getOrganizationTerms,
  getOrganizationBehavior,
  getRoleLabel
} from "@/lib/organization-types";

export interface ParsedMember {
  fullName: string;
  phone: string;
  email: string;
  block: string;
  unit: string;
  role: "admin" | "syndic" | "resident" | "collaborator";
  isValid: boolean;
  errors: string[];
}

interface ImportMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (members: ParsedMember[]) => Promise<{ success: number; failed: number }>;
  terms?: OrganizationTerms;
  behavior?: OrganizationBehavior;
}

type Step = "upload" | "preview" | "importing" | "done";

const roleMap: Record<string, "admin" | "syndic" | "resident" | "collaborator"> = {
  morador: "resident",
  residente: "resident",
  resident: "resident",
  sindico: "syndic",
  síndico: "syndic",
  syndic: "syndic",
  admin: "admin",
  administrador: "admin",
  colaborador: "collaborator",
  collaborator: "collaborator",
  // Additional mappings for other org types
  paciente: "resident",
  membro: "resident",
  franqueado: "resident",
  gestor: "syndic",
  pastor: "syndic",
  presidente: "syndic",
  franqueador: "syndic",
};

function parseRole(value: string | undefined): "admin" | "syndic" | "resident" | "collaborator" {
  if (!value) return "resident";
  const normalized = value.toString().toLowerCase().trim();
  return roleMap[normalized] || "resident";
}

export function ImportMembersDialog({
  open,
  onOpenChange,
  onImport,
  terms = getOrganizationTerms("condominium"),
  behavior = getOrganizationBehavior("condominium"),
}: ImportMembersDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [parsedMembers, setParsedMembers] = useState<ParsedMember[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const validCount = parsedMembers.filter((m) => m.isValid).length;
  const invalidCount = parsedMembers.filter((m) => !m.isValid).length;

  const resetDialog = useCallback(() => {
    setStep("upload");
    setParsedMembers([]);
    setProgress(0);
    setImportResult(null);
  }, []);

  const handleClose = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      resetDialog();
    }
    onOpenChange(isOpen);
  }, [onOpenChange, resetDialog]);

  const validateMember = useCallback((row: any[]): ParsedMember => {
    const errors: string[] = [];
    
    const fullName = (row[0] || "").toString().trim();
    const phone = (row[1] || "").toString().trim();
    const email = (row[2] || "").toString().trim();
    const rawBlock = (row[3] || "").toString().trim();
    const rawUnit = (row[4] || "").toString().trim();
    const roleStr = (row[5] || "").toString().trim();
    
    if (fullName && fullName.length < 2) errors.push("Nome inválido (mín. 2 caracteres)");
    if (!phone) errors.push("Telefone obrigatório");
    if (email && !email.includes("@")) errors.push("Email inválido");
    
    // Validar campos de localização usando a função unificada
    const blockValid = validateLocationOptional(
      rawBlock,
      "block",
      behavior.blockValidation,
      behavior.requiresLocation
    );
    const unitValid = validateLocationOptional(
      rawUnit,
      "unit",
      behavior.unitValidation,
      behavior.requiresLocation
    );

    if (!blockValid) {
      if (behavior.requiresLocation) {
        errors.push(`${terms.block} obrigatório`);
      } else if (rawBlock && behavior.blockValidation === "strict") {
        errors.push(`${terms.block} inválido (use número ou letra única)`);
      }
    }
    
    if (!unitValid) {
      if (behavior.requiresLocation) {
        errors.push(`${terms.unit} obrigatório`);
      } else if (rawUnit && behavior.unitValidation === "strict") {
        errors.push(`${terms.unit} inválido (use apenas números)`);
      }
    }
    
    // Formatar bloco se for validação estrita
    const block = behavior.blockValidation === "strict" ? formatBlock(rawBlock) : rawBlock;
    
    return {
      fullName,
      phone,
      email,
      block,
      unit: rawUnit,
      role: parseRole(roleStr),
      isValid: errors.length === 0,
      errors,
    };
  }, [behavior, terms]);

  const parseFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Skip header row if it looks like a header
        const startRow = jsonData[0]?.[0]?.toString().toLowerCase().includes("nome") ? 1 : 0;
        
        const members = jsonData
          .slice(startRow)
          .filter((row) => row.some((cell) => cell !== undefined && cell !== ""))
          .map((row) => validateMember(row));
        
        setParsedMembers(members);
        setStep("preview");
      } catch (error) {
        console.error("Error parsing file:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [validateMember]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  const downloadTemplate = useCallback(() => {
    // Dynamic headers based on organization type
    const blockHeader = behavior.requiresLocation 
      ? terms.block 
      : `${terms.block} (opcional)`;
    const unitHeader = behavior.requiresLocation 
      ? terms.unit 
      : `${terms.unit} (opcional)`;

    const ws = XLSX.utils.aoa_to_sheet([
      ["Nome (opcional)", "Telefone", "Email (opcional)", blockHeader, unitHeader, "Função"],
      ["João da Silva", "11999999999", "joao@email.com", "A", "101", getRoleLabel("resident", terms).toLowerCase()],
      ["Maria Santos", "11988888888", "maria@email.com", "B", "202", getRoleLabel("resident", terms).toLowerCase()],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, terms.memberPlural);
    const filename = `modelo_${terms.memberPlural.toLowerCase()}.xlsx`;
    XLSX.writeFile(wb, filename);
  }, [terms, behavior]);

  const handleImport = useCallback(async () => {
    const validMembers = parsedMembers.filter((m) => m.isValid);
    if (validMembers.length === 0) return;

    setStep("importing");
    setProgress(0);

    // Simulate progress updates during import
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 200);

    try {
      const result = await onImport(validMembers);
      clearInterval(progressInterval);
      setProgress(100);
      setImportResult(result);
      setStep("done");
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Import error:", error);
      setImportResult({ success: 0, failed: validMembers.length });
      setStep("done");
    }
  }, [parsedMembers, onImport]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importar {terms.memberPlural}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Faça upload de uma planilha Excel (.xlsx) ou CSV"}
            {step === "preview" && "Revise os dados antes de importar"}
            {step === "importing" && `Importando ${terms.memberPlural.toLowerCase()}...`}
            {step === "done" && "Importação concluída"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {/* Step: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Arraste sua planilha aqui</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Aceita arquivos .xlsx, .xls ou .csv
                </p>
                <label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <Button variant="outline" asChild>
                    <span>Selecionar arquivo</span>
                  </Button>
                </label>
              </div>

              <div className="flex items-center justify-center">
                <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar modelo de planilha
                </Button>
              </div>

              {!behavior.requiresLocation && (
                <p className="text-xs text-center text-muted-foreground">
                  Para {terms.organizationPlural.toLowerCase()}, os campos {terms.block} e {terms.unit} são opcionais.
                </p>
              )}
            </div>
          )}

          {/* Step: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="default" className="bg-green-500/20 text-green-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {validCount} válidos
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive" className="bg-destructive/20 text-destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    {invalidCount} com erro
                  </Badge>
                )}
              </div>

              <div className="border rounded-lg overflow-auto max-h-[40vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Status</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>{terms.block}</TableHead>
                      <TableHead>{terms.unit}</TableHead>
                      <TableHead>Função</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedMembers.map((member, index) => (
                      <TableRow
                        key={index}
                        className={!member.isValid ? "bg-destructive/5" : ""}
                      >
                        <TableCell>
                          {member.isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {member.fullName || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {member.phone || <span className="text-destructive">—</span>}
                        </TableCell>
                        <TableCell>
                          {member.email || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {member.block || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {member.unit || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="capitalize">{getRoleLabel(member.role, terms)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {invalidCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Apenas os {validCount} registros válidos serão importados.
                </p>
              )}
            </div>
          )}

          {/* Step: Importing */}
          {step === "importing" && (
            <div className="py-8 space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                Importando {validCount} {terms.memberPlural.toLowerCase()}...
              </p>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && importResult && (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
              <div>
                <p className="text-lg font-medium">Importação concluída!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {importResult.success} {terms.member.toLowerCase()}(s) importado(s) com sucesso
                  {importResult.failed > 0 && `, ${importResult.failed} falha(s)`}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={resetDialog}>
                Voltar
              </Button>
              <Button onClick={handleImport} disabled={validCount === 0}>
                Importar {validCount} {terms.member.toLowerCase()}(s)
              </Button>
            </>
          )}

          {step === "done" && (
            <Button onClick={() => handleClose(false)}>Fechar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
