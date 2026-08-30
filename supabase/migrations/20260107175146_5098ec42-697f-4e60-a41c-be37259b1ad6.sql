-- Criar bucket para imagens dos empreendimentos
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

-- Criar bucket para PDFs dos empreendimentos
INSERT INTO storage.buckets (id, name, public) VALUES ('property-documents', 'property-documents', true);

-- Criar bucket para documentos dos clientes (privado)
INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', false);

-- Policies para property-images (público pode ver, admin pode upload)
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Admins can upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images' AND public.is_admin(auth.uid()));

-- Policies para property-documents (público pode ver, admin pode upload)
CREATE POLICY "Anyone can view property documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-documents');

CREATE POLICY "Admins can upload property documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-documents' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update property documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-documents' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete property documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-documents' AND public.is_admin(auth.uid()));

-- Policies para client-documents (cliente pode upload, admin/corretor pode ver)
CREATE POLICY "Anyone can upload client documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'client-documents');

CREATE POLICY "Admins can view all client documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'client-documents' AND public.is_admin(auth.uid()));

CREATE POLICY "Brokers can view client documents of accepted proposals"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'client-documents' AND
    EXISTS (
      SELECT 1 FROM public.proposals p
      JOIN public.client_documents cd ON cd.proposal_id = p.id
      WHERE p.assigned_broker_id = auth.uid()
      AND p.status IN ('in_progress', 'completed')
      AND cd.file_url LIKE '%' || storage.objects.name
    )
  );