-- V2__seed_initial_data.sql
-- Initial Data Seeding for StockFlow Demo (Admin, Cashier, Owner & Initial Master Data)

-- Passwords are hashed with BCrypt (password: "password123")
INSERT INTO users (username, email, password, full_name, role, is_active) VALUES
('admin', 'admin@stockflow.id', '$2a$10$e8WfGqZ9T6hJpL2yO.U8O.z1n0S2j1R3q4v5w6x7y8z9a0b1c2d3e', 'Budi Pratama (Admin)', 'ADMIN', TRUE),
('kasir1', 'kasir1@stockflow.id', '$2a$10$e8WfGqZ9T6hJpL2yO.U8O.z1n0S2j1R3q4v5w6x7y8z9a0b1c2d3e', 'Siti Rahma (Kasir Pagi)', 'CASHIER', TRUE),
('owner', 'owner@stockflow.id', '$2a$10$e8WfGqZ9T6hJpL2yO.U8O.z1n0S2j1R3q4v5w6x7y8z9a0b1c2d3e', 'Haji Hendra (Pemilik Toko)', 'OWNER', TRUE);

-- Initial Categories
INSERT INTO categories (name, description) VALUES
('Sembako & Beras', 'Kebutuhan pokok rumah tangga'),
('Minuman Kemasan', 'Air mineral, kopi, teh, dan minuman dingin'),
('Makanan Ringan', 'Camilan, biskuit, dan keripik'),
('Perlengkapan Mandi', 'Sabun, sampo, pasta gigi, dan pembersih');

-- Initial Products
INSERT INTO products (sku, name, category_id, cost_price, selling_price, current_stock, min_stock, unit) VALUES
('PRD-SBK-001', 'Beras Premium Ramos 5kg', 1, 62000.00, 74000.00, 18, 5, 'karung'),
('PRD-SBK-002', 'Minyak Goreng Sania 2 Liter', 1, 29500.00, 35000.00, 3, 10, 'pouch'),
('PRD-MNM-001', 'Le Minerale 600ml', 2, 2200.00, 3500.00, 48, 12, 'botol'),
('PRD-MNM-002', 'Kopi Kapal Api Special 165g', 2, 11500.00, 14500.00, 2, 8, 'bungkus'),
('PRD-MKN-001', 'Indomie Goreng Original 85g', 3, 2750.00, 3300.00, 120, 30, 'pcs'),
('PRD-MKN-002', 'Biskuit Khong Guan Red Can 1600g', 3, 88000.00, 102000.00, 6, 3, 'kaleng'),
('PRD-MND-001', 'Sabun Lifebuoy Red 110g', 4, 3800.00, 5000.00, 24, 10, 'pcs'),
('PRD-MND-002', 'Sampo Pantene Anti Dandruff 160ml', 4, 21000.00, 26500.00, 1, 5, 'botol');

-- Initial Suppliers
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('PT Distribusi Sembako Nusantara', 'Pak Hendro', '0812-9988-7766', 'orders@sembakonusantara.co.id', 'Kawasan Industri Pulo Gadung Blok C4, Jakarta Timur'),
('CV Mayora Supply Chain', 'Ibu Ratna', '0813-1122-3344', 'ratna@mayorasupply.com', 'Jl. Raya Daan Mogot Km 18, Tangerang'),
('Distributor Unilever Indonesia', 'Mas Agus', '0857-4433-2211', 'agus.dist@unileverpartner.id', 'Jl. Gatot Subroto No. 88, Jakarta Selatan');
