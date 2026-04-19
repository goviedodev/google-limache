DELETE FROM locales;
INSERT INTO locales (id, nombre, categoria, direccion, rating, horario)
VALUES 
('loc-001', 'Club Social Italo Chileno', 'restaurante', 'Av. Republica 35, Limache', 4.5, 'Lun: 10AM-5PM'),
('loc-002', 'Wherepaulo sushi', 'restaurante', '12 de Febrero 245, Limache', 3, 'Mar-Dom: 12PM-11PM'),
('loc-003', 'Kustom Burguer', 'restaurante', '12 de Febrero 245, Limache', 4, 'Mar-Dom: 12PM-11PM'),
('loc-004', 'Cafe Central', 'cafe', 'Av. Valparaiso 456, Limache', 4.2, 'Lun-Sab: 8AM-8PM'),
('loc-005', 'Farmacia Sana', 'salud', 'Av. Palma 567, Limache', 4.0, '24 horas');