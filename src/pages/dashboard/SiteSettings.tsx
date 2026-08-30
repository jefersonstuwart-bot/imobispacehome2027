import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Image as ImageIcon, Video, Save, Upload, Monitor, Smartphone } from 'lucide-react';

const SETTINGS_KEY = 'imobispace_hero_background';

export default function SiteSettings() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState<'image' | 'video'>('image');
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      const { data } = await supabase.from('site_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
      if (data?.value) {
        try {
          const value = JSON.parse(data.value as string);
          setType(value.type === 'video' ? 'video' : 'image');
          setUrl(value.url || '');
          setPreview(value.url || '');
        } catch { /* ignore invalid saved value */ }
      }
    };
    load();
  }, [isAdmin]);

  const handleSave = async () => {
    if (!url.trim()) {
      toast({ title: 'Selecione ou informe um arquivo', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const value = JSON.stringify({ type, url: url.trim() });
    const { error } = await supabase.from('site_settings').upsert({ key: SETTINGS_KEY, value }, { onConflict: 'key' });
    setSaving(false);
    if (error) {
      toast({ title: 'Não foi possível salvar', description: error.message, variant: 'destructive' });
      return;
    }
    setPreview(url.trim());
    toast({ title: 'Alteração salva', description: 'O novo fundo ficará disponível após a atualização do site.' });
  };

  const [uploading, setUploading] = useState(false);

  const handleLocalFile = async (file?: File) => {
    if (!file) return;
    const valid = type === 'video' ? file.type.startsWith('video/') : file.type.startsWith('image/');
    if (!valid) {
      toast({ title: type === 'video' ? 'Selecione um vídeo válido' : 'Selecione uma imagem válida', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop() || (type === 'video' ? 'mp4' : 'jpg');
    const path = `hero/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('site-assets').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });
    if (uploadError) {
      setUploading(false);
      toast({ title: 'Falha no envio do arquivo', description: uploadError.message, variant: 'destructive' });
      return;
    }
    const { data: signed, error: signedError } = await supabase.storage
      .from('site-assets')
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setUploading(false);
    if (signedError || !signed?.signedUrl) {
      toast({ title: 'Não foi possível gerar o link do arquivo', variant: 'destructive' });
      return;
    }
    setUrl(signed.signedUrl);
    setPreview(signed.signedUrl);
    toast({ title: 'Arquivo enviado', description: 'Agora clique em "Salvar fundo" para aplicar no site.' });
  };


  if (!isAdmin) return null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Painel do diretor</p>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Personalizar Site</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">Troque o fundo principal do site sem precisar alterar o código.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground">
            <Monitor className="h-4 w-4" /> Desktop
            <span>•</span>
            <Smartphone className="h-4 w-4" /> Celular
          </div>
        </div>

        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl">Fundo principal do site</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={type} onValueChange={(v) => setType(v as 'image' | 'video')}>
              <TabsList className="grid w-full max-w-lg grid-cols-2">
                <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" />Imagem</TabsTrigger>
                <TabsTrigger value="video"><Video className="mr-2 h-4 w-4" />Vídeo</TabsTrigger>
              </TabsList>
              <TabsContent value="image" className="space-y-4 pt-4">
                <div><Label>Imagem do fundo</Label><p className="mb-2 text-xs text-muted-foreground">Use uma imagem em alta resolução para melhor nitidez.</p><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL da imagem" /></div>
                <label className="inline-flex cursor-pointer"><Button type="button" variant="outline" asChild disabled={uploading}><span><Upload className="mr-2 h-4 w-4" />{uploading ? 'Enviando...' : 'Selecionar imagem'}</span></Button><input className="hidden" type="file" accept="image/*" onChange={(e) => handleLocalFile(e.target.files?.[0])} /></label>
              </TabsContent>
              <TabsContent value="video" className="space-y-4 pt-4">
                <div><Label>Vídeo do fundo</Label><p className="mb-2 text-xs text-muted-foreground">Recomendado: MP4 ou WebM, sem áudio, otimizado para web.</p><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL do vídeo" /></div>
                <label className="inline-flex cursor-pointer"><Button type="button" variant="outline" asChild disabled={uploading}><span><Upload className="mr-2 h-4 w-4" />{uploading ? 'Enviando...' : 'Selecionar vídeo'}</span></Button><input className="hidden" type="file" accept="video/mp4,video/webm,video/*" onChange={(e) => handleLocalFile(e.target.files?.[0])} /></label>
              </TabsContent>
            </Tabs>

            {preview && <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border bg-muted shadow-sm">{type === 'video' ? <video src={preview} muted autoPlay loop playsInline className="h-full w-full object-cover" /> : <img src={preview} alt="Pré-visualização do fundo" className="h-full w-full object-cover" />}</div>}

            <Button onClick={handleSave} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar fundo'}</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
