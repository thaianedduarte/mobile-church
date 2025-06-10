
-- Habilitar RLS nas tabelas principais
ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doacoes ENABLE ROW LEVEL SECURITY;

-- Política para membros: usuários só podem ver seu próprio registro
CREATE POLICY "Usuários podem ver apenas seus próprios dados" ON public.membros
    FOR SELECT USING (
        profiles.id = auth.uid()
    );

-- Política para eventos: todos os membros autenticados podem ver eventos
CREATE POLICY "Membros autenticados podem ver eventos" ON public.eventos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para avisos: todos os membros autenticados podem ver avisos ativos
CREATE POLICY "Membros autenticados podem ver avisos ativos" ON public.avisos
    FOR SELECT USING (
        auth.role() = 'authenticated' AND ativo = true
    );

-- Política para doações: usuários só podem ver suas próprias doações
CREATE POLICY "Usuários podem ver apenas suas doações" ON public.doacoes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.membros 
            WHERE membros.id = doacoes.membro_id 
            AND profiles.id = auth.uid()
        )
    );

-- Adicionar coluna profile_id em membros se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'membros' AND column_name = 'profile_id') THEN
        ALTER TABLE public.membros ADD COLUMN profile_id UUID REFERENCES public.profiles(id);
        CREATE INDEX IF NOT EXISTS idx_membros_profile_id ON public.membros(profile_id);
    END IF;
END $$;

-- Atualizar política de membros para usar profile_id
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios dados" ON public.membros;
CREATE POLICY "Usuários podem ver apenas seus próprios dados" ON public.membros
    FOR SELECT USING (profile_id = auth.uid());

-- Atualizar política de doações para usar profile_id
DROP POLICY IF EXISTS "Usuários podem ver apenas suas doações" ON public.doacoes;
CREATE POLICY "Usuários podem ver apenas suas doações" ON public.doacoes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.membros 
            WHERE membros.id = doacoes.membro_id 
            AND membros.profile_id = auth.uid()
        )
    );
