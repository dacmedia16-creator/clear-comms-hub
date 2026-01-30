
# Remover Botão "Enviar WhatsApp" do Diálogo de Sucesso

## O que será feito

Remover o botão "Enviar WhatsApp" do diálogo que aparece após publicar um aviso com sucesso, mantendo apenas o botão "Fechar".

---

## Mudança Técnica

### Arquivo: `src/pages/AdminCondominiumPage.tsx`

Remover o componente `SendWhatsAppButton` do `DialogFooter` (linhas 718-726).

**Antes:**
```tsx
<DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
  <Button variant="outline" onClick={() => setSuccessDialogOpen(false)} className="w-full sm:w-auto">
    Fechar
  </Button>
  {lastCreatedAnnouncement && (
    <SendWhatsAppButton
      announcement={{ ...lastCreatedAnnouncement, id: lastCreatedAnnouncement.id }}
      condominium={{ ...condominium, id: condominium.id }}
      variant="default"
      size="default"
      showLabel
    />
  )}
</DialogFooter>
```

**Depois:**
```tsx
<DialogFooter className="sm:justify-center">
  <Button variant="outline" onClick={() => setSuccessDialogOpen(false)}>
    Fechar
  </Button>
</DialogFooter>
```

---

## Resultado

O diálogo de sucesso mostrará apenas:
- Ícone de check
- Título "Aviso publicado!"  
- Descrição do sucesso
- Preview do aviso criado
- Botão "Fechar" centralizado
