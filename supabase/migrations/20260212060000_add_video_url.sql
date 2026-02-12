-- Add video_url column to products table
ALTER TABLE public.products
ADD COLUMN video_url text;

-- Comment on column
COMMENT ON COLUMN public.products.video_url IS 'URL to a product video (e.g., YouTube, Vimeo)';
