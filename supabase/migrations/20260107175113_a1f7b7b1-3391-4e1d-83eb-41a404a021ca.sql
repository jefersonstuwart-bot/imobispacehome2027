-- Enum para tipos de usuário
CREATE TYPE public.user_role AS ENUM ('admin', 'broker');

-- Enum para status do corretor
CREATE TYPE public.broker_status AS ENUM ('online', 'offline');

-- Enum para status da proposta
CREATE TYPE public.proposal_status AS ENUM ('new', 'pending_acceptance', 'in_progress', 'completed', 'redistributed');

-- Enum para tipo de proposta
CREATE TYPE public.proposal_type AS ENUM ('cash', 'financed');

-- Enum para estado civil
CREATE TYPE public.marital_status AS ENUM ('single', 'married', 'divorced', 'widowed');

-- Tabela de perfis de usuários (admin e corretores)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'broker',
  status broker_status DEFAULT 'offline',
  is_active BOOLEAN DEFAULT true,
  proposals_count INTEGER DEFAULT 0,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de empreendimentos
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  ai_description TEXT,
  images TEXT[] DEFAULT '{}',
  pdf_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de propostas
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  assigned_broker_id UUID REFERENCES public.profiles(id),
  
  -- Dados do cliente
  client_name TEXT NOT NULL,
  client_cpf TEXT NOT NULL,
  client_rg TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_marital_status marital_status NOT NULL,
  
  -- Dados do cônjuge (se casado)
  spouse_name TEXT,
  spouse_cpf TEXT,
  spouse_rg TEXT,
  
  -- Tipo e valores da proposta
  proposal_type proposal_type NOT NULL,
  proposal_value DECIMAL(15,2) NOT NULL,
  proposal_description TEXT,
  
  -- Status e controle
  status proposal_status DEFAULT 'new',
  accepted_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  redistribution_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de documentos do cliente
CREATE TABLE public.client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  is_spouse_document BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para controle da roleta de distribuição
CREATE TABLE public.broker_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_assigned_at TIMESTAMPTZ,
  queue_position INTEGER DEFAULT 0,
  UNIQUE(broker_id)
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_queue ENABLE ROW LEVEL SECURITY;

-- Função para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = 'admin'
  )
$$;

-- Policies para profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR id = auth.uid());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR id = auth.uid());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()) OR id = auth.uid());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Policies para properties (público pode ver, admin pode editar)
CREATE POLICY "Anyone can view active properties"
  ON public.properties FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete properties"
  ON public.properties FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Policies para proposals
CREATE POLICY "Anyone can insert proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all proposals"
  ON public.proposals FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Brokers can view assigned proposals"
  ON public.proposals FOR SELECT
  TO authenticated
  USING (assigned_broker_id = auth.uid());

CREATE POLICY "Admins can update all proposals"
  ON public.proposals FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Brokers can update assigned proposals"
  ON public.proposals FOR UPDATE
  TO authenticated
  USING (assigned_broker_id = auth.uid());

-- Policies para client_documents
CREATE POLICY "Anyone can insert documents"
  ON public.client_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all documents"
  ON public.client_documents FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Brokers can view documents of accepted proposals"
  ON public.client_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id
      AND p.assigned_broker_id = auth.uid()
      AND p.status IN ('in_progress', 'completed')
    )
  );

-- Policies para broker_queue
CREATE POLICY "Admins can manage broker queue"
  ON public.broker_queue FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'broker')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habilitar realtime para propostas e profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;