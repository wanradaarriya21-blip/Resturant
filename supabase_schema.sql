-- สคริปต์ SQL สำหรับสร้างตารางบนฐานข้อมูล Supabase
-- ให้คัดลอกรหัสนี้ไปรันในช่อง SQL Editor ของโปรเจกต์ Supabase ของคุณ

-- 1. ลบตารางเดิมหากมีอยู่ (เรียงลำดับเพื่อเลี่ยงปัญหา Foreign Key)
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.menu_items;

-- 2. สร้างตาราง Menu Items (รายการเมนูอาหาร)
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL, -- เช่น 'Appetizers', 'Mains', 'Desserts', 'Drinks'
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. สร้างตาราง Orders (ข้อมูลการสั่งซื้อ)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    table_number TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'preparing', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. สร้างตาราง Order Items (รายการอาหารในใบสั่งซื้อแต่ละใบ)
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL, -- บันทึกราคา ณ ตอนที่สั่งซื้อ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. การตั้งค่าความปลอดภัย (Row Level Security - RLS)
-- เปิดใช้งาน RLS บนทุกตาราง
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 6. สร้างนโยบายการเข้าถึงข้อมูล (Policies) เพื่อให้แอปสั่งอาหารออนไลน์สามารถอ่าน/เขียนได้โดยตรงจาก Client
-- สำหรับเมนูอาหาร: ให้ทุกคนดูได้ และให้สามารถเพิ่มเมนูใหม่ได้ (เพื่อการทำ Seed เมนูอาหารเริ่มต้น)
CREATE POLICY "Allow public select on menu_items" 
    ON public.menu_items FOR SELECT USING (true);

CREATE POLICY "Allow public insert on menu_items" 
    ON public.menu_items FOR INSERT WITH CHECK (true);

-- สำหรับใบสั่งซื้อ: ให้ทุกคนสร้างใบสั่งซื้อใหม่ และดูสถานะใบสั่งซื้อของตนเองได้
CREATE POLICY "Allow public insert on orders" 
    ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on orders" 
    ON public.orders FOR SELECT USING (true);

-- สำหรับรายการในใบสั่งซื้อ: ให้สร้างรายการและดูรายการสั่งซื้อได้
CREATE POLICY "Allow public insert on order_items" 
    ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on order_items" 
    ON public.order_items FOR SELECT USING (true);

-- 7. ตัวอย่างข้อมูลเริ่มต้น (เมนูทดสอบ) ในกรณีที่ต้องการ Seed ผ่าน SQL โดยตรง
-- (หมายเหตุ: ตัวระบบเว็บจะทำการ Seed ให้อัตโนมัติหากตารางยังว่างอยู่ แต่ระบุไว้ตรงนี้เป็นทางเลือก)
INSERT INTO public.menu_items (name, description, price, category, image_url) VALUES
('ผัดไทยกุ้งสด (Classic Pad Thai)', 'ผัดไทยสูตรดั้งเดิม เส้นจันท์เหนียวนุ่ม ผัดกับซอสสูตรพิเศษและกุ้งแม่น้ำตัวโต', 150.00, 'Mains', 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=600&q=80'),
('แกงเขียวหวานไก่ (Green Curry Chicken)', 'แกงเขียวหวานรสชาติเข้มข้น หอมเครื่องแกง ทานคู่กับมะเขือเปราะและข้าวสวยร้อนๆ', 180.00, 'Mains', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80'),
('ต้มยำกุ้งน้ำข้น (Tom Yum Goong)', 'ต้มยำกุ้งน้ำข้นรสจัดจ้าน ครบเครื่องสมุนไพร ข่า ตะไคร้ ใบมะกรูด และเห็ดฟาง', 220.00, 'Mains', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'),
('ทอดมันกุ้ง (Thai Shrimp Cakes)', 'ทอดมันกุ้งชุบเกล็ดขนมปังทอดจนเหลืองกรอบ เนื้อกุ้งเด้ง ทานคู่กับน้ำจิ้มบ๊วยเจี่ย', 120.00, 'Appetizers', 'https://images.unsplash.com/photo-1582450871972-ab5ca641643d?auto=format&fit=crop&w=600&q=80'),
('ข้าวเหนียวมะม่วง (Mango Sticky Rice)', 'มะม่วงน้ำดอกไม้หวานฉ่ำ เสิร์ฟพร้อมข้าวเหนียวมูนราดน้ำกะทิสดเข้มข้น', 140.00, 'Desserts', 'https://images.unsplash.com/photo-1528279027-68f0d7fce9f1?auto=format&fit=crop&w=600&q=80'),
('ชาไทยเย็น (Thai Iced Tea)', 'ชาไทยสีส้มเป็นเอกลักษณ์ รสชาติหอมหวานมัน เข้มข้นกลมกล่อม', 65.00, 'Drinks', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80');
