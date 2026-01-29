

# Promoção para Super Admin

## Usuário Identificado
- **Nome**: Denis
- **Email**: dacmedia16@gmail.com
- **Profile ID**: `e44ce79a-ee72-425c-800d-a842f0530bd2`

## Acao Necessaria

Executar o seguinte comando SQL para promover o usuario a Super Admin:

```sql
INSERT INTO super_admins (user_id) 
VALUES ('e44ce79a-ee72-425c-800d-a842f0530bd2');
```

## O Que Vai Acontecer

Apos a execucao:

1. O usuario **Denis** tera acesso ao painel Super Admin
2. Podera gerenciar todos os condominios da plataforma
3. Podera promover outros usuarios a Super Admin
4. Tera visao global de todos os usuarios do sistema

## Como Acessar

Apos a promocao:

1. Faca login com `dacmedia16@gmail.com`
2. Acesse o Dashboard (`/dashboard`)
3. Clique no link **"Super Admin"** que aparecera no header
4. Ou acesse diretamente: `/super-admin`

## Secao Tecnica

A migration executara um INSERT na tabela `super_admins` vinculando o `profile.id` do usuario ao sistema de Super Admin. As RLS policies ja estao configuradas para reconhecer este usuario como Super Admin atraves da funcao `is_super_admin()`.

