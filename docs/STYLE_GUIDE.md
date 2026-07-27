# Validador Judicial - Enterprise Design System

## 1. Color System

### Light Theme

- Background: `hsl(210 40% 98%)` (`#F8FAFC`)
- Surface: `hsl(0 0% 100%)` (`#FFFFFF`)
- Card: `hsl(0 0% 100%)` (`#FFFFFF`)
- Foreground: `hsl(220 47% 11%)`
- Primary: `hsl(218 81% 52%)` (`#2563EB`)
- Secondary: `hsl(173 72% 28%)` (`#0F766E`)
- Accent: `hsl(252 87% 67%)` (`#8B5CF6`)
- Success: `hsl(142 71% 36%)` (`#16A34A`)
- Warning: `hsl(38 92% 50%)` (`#F59E0B`)
- Error/Danger: `hsl(0 72% 51%)` (`#DC2626`)
- Info: `hsl(217 91% 60%)`
- Neutral: `hsl(215 20% 65%)`
- Border: `hsl(214 32% 90%)`
- Hover: `hsl(214 35% 94%)`
- Focus Ring: `hsl(218 81% 52%)`
- Disabled: `hsl(214 20% 92%)`

### Dark Theme

- Background: `hsl(221 44% 9%)` (`#0B1220`)
- Surface: `hsl(222 39% 13%)` (`#111827`)
- Card: `hsl(221 35% 17%)` (`#172033`)
- Foreground: `hsl(210 40% 96%)`
- Primary: `hsl(218 84% 58%)`
- Secondary: `hsl(175 66% 33%)`
- Accent: `hsl(253 87% 70%)`
- Success: `hsl(142 67% 44%)`
- Warning: `hsl(38 92% 58%)`
- Error/Danger: `hsl(0 82% 63%)`
- Info: `hsl(217 91% 67%)`
- Neutral: `hsl(215 20% 64%)`
- Border: `hsl(223 25% 24%)`
- Hover: `hsl(223 24% 21%)`
- Focus Ring: `hsl(218 84% 58%)`
- Disabled: `hsl(223 18% 22%)`

### CSS Variables (Semantic)

- `--background`
- `--foreground`
- `--surface`
- `--card`
- `--card-foreground`
- `--primary`
- `--primary-foreground`
- `--secondary`
- `--secondary-foreground`
- `--accent`
- `--accent-foreground`
- `--muted`
- `--muted-foreground`
- `--border`
- `--input`
- `--ring`
- `--success`
- `--warning`
- `--danger`
- `--info`
- `--neutral`
- `--hover`
- `--disabled`

## 2. Typography

Professional choice: **Manrope + Plus Jakarta Sans**

- Manrope gives a premium, structured visual for headings (closer to modern SaaS dashboards).
- Plus Jakarta Sans is highly legible for dense forms and tables.

Scale:

- Display: `text-4xl md:text-5xl`, `600`, `1.1`, `-0.02em`
- Heading: `text-3xl`, `600`, `1.15`, `-0.015em`
- Title: `text-2xl`, `600`, `1.2`, `-0.01em`
- Subtitle: `text-lg`, `500`, `1.35`, `0`
- Body: `text-sm`, `400`, `1.7`, `0`
- Caption: `text-xs`, `400`, `1.6`, `0`
- Label: `text-xs`, `600`, `1.4`, `0.12em`

## 3. Spacing Scale

Always use: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

## 4. Radius

- Inputs: `md`
- Buttons: `md`
- Cards: `xl`
- Dialogs: `xl`
- Badge: `full`
- Tooltip/Popover: `md`

## 5. Shadows

- `shadow-xs`
- `shadow-sm`
- `shadow`
- `shadow-lg`
- `shadow-xl`

## 6. Buttons

Variants:

- Primary
- Secondary
- Outline
- Ghost
- Danger
- Success
- Icon
- Loading
- Disabled

## 7. Input States

All controls support:

- normal
- hover
- focus
- disabled
- error
- warning
- success

## 8. Status Badges

Statuses with icon + color + accessible contrast:

- Sucesso/Aprovado
- Erro/Rejeitado
- Pendente
- Em análise
- Submetido
- Rascunho

## 9. Iconography (Lucide)

Global map includes:

- Dashboard → `LayoutDashboard`
- Nova Solicitação → `FilePlus`
- Solicitações → `Files`
- Pendências → `Clock3`
- Aprovado → `BadgeCheck`
- Usuários → `Users`
- Configuração → `Settings`
- Ajuda → `CircleHelp`
- IA → `Sparkles`
- Upload → `UploadCloud`
- Download → `Download`
- Relatórios → `BarChart3`
- Empresa → `Building2`
- Pessoa → `User`
- Documento → `FileText`
- CNPJ → `Building`
- Cidade → `MapPin`
- Calendário → `Calendar`
- Valor → `Wallet`
- Pesquisa → `Search`
- Filtro → `Filter`
- Excluir → `Trash2`
- Editar → `Pencil`
- Salvar → `Save`
- Cancelar → `X`
- Confirmar → `Check`
- Voltar → `ArrowLeft`
- Avançar → `ArrowRight`
- Logout → `LogOut`
- Tema → `Moon` / `Sun`

## 10. Accessibility

- WCAG AA contrast target
- visible focus rings
- semantic labels/ARIA on controls
- keyboard navigation for menus and steppers
- reduced-motion friendly transitions
