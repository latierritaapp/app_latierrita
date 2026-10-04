-- =========================================================
-- ESQUEMA DE BASE DE DATOS PARA LA TIERRITA (SUPABASE)
-- =========================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE PERFILES DE USUARIOS (vinculada con auth.users si se usa auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  last_name TEXT,
  email TEXT UNIQUE,
  birth_date DATE,
  origin_city TEXT DEFAULT 'Bogotá',
  current_city TEXT DEFAULT 'Madrid',
  role TEXT DEFAULT 'usuario' CHECK (role IN ('invitado', 'usuario', 'moderador', 'soporte', 'administrador')),
  is_staff BOOLEAN DEFAULT FALSE,
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  website TEXT,
  instagram TEXT,
  tiktok TEXT,
  facebook TEXT,
  x_twitter TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA DE PUBLICACIONES (POSTS)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_avatar TEXT DEFAULT '',
  location TEXT,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  disable_comments BOOLEAN DEFAULT FALSE,
  hide_likes_count BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE COMENTARIOS
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_avatar TEXT DEFAULT '',
  text TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA DE LIKES (para evitar likes duplicados por usuario)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, profile_id)
);

-- 5. TABLA DE GUARDADOS (SAVED POSTS)
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, profile_id)
);

-- 6. TABLA DE ANUNCIOS (EMPLEO, VIVIENDA, SERVICIOS, ETC.)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  price NUMERIC(10, 2),
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (cualquier usuario puede ver el contenido)
CREATE POLICY "Lectura pública de perfiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Lectura pública de posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Lectura pública de comentarios" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Lectura pública de anuncios" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Lectura de likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Lectura de guardados" ON public.saved_posts FOR SELECT USING (true);

-- Políticas de escritura abierta (para inserción y actualización con anon key)
CREATE POLICY "Inserción de perfiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización de perfiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Inserción de posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización de posts" ON public.posts FOR UPDATE USING (true);
CREATE POLICY "Eliminación de posts" ON public.posts FOR DELETE USING (true);
CREATE POLICY "Inserción de comentarios" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación de comentarios" ON public.comments FOR DELETE USING (true);
CREATE POLICY "Inserción de anuncios" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Eliminación de anuncios" ON public.announcements FOR DELETE USING (true);
CREATE POLICY "Gestión de likes" ON public.post_likes FOR ALL USING (true);
CREATE POLICY "Gestión de guardados" ON public.saved_posts FOR ALL USING (true);

-- Almacenamiento (Storage Buckets):
-- Crear buckets públicos para imágenes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('announcement-images', 'announcement-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Imágenes públicas de posts" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Subida de imágenes de posts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Imágenes públicas de anuncios" ON storage.objects FOR SELECT USING (bucket_id = 'announcement-images');
CREATE POLICY "Subida de imágenes de anuncios" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'announcement-images');

CREATE POLICY "Avatares públicos" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Subida de avatares" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
