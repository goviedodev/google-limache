DELETE FROM locales;

INSERT INTO locales (id, nombre, categoria, direccion, rating, horario, website, celular, plus_code, indicaciones)
VALUES 
('loc-001', 'Club Social Italo Chileno', 'restaurante', 'Av. Republica 35, Limache', 4.5, 'Monday: 10AM-5PM', 'http://www.italochilenolimache.cl', '(2) 3365 9886', '47RCXPXJ+9V', 'Av. Republica 35, 2240462 Limache, Valparaiso, Chile'),
('loc-002', 'Wherepaulo sushi', 'restaurante', '12 de Febrero 245, Limache', 3, 'Monday: 12PM-11PM', NULL, '9 8306 5051', '47RCXPRP+CH', '12 de Febrero 245, 2240000 Limache, Valparaiso, Chile'),
('loc-003', 'Kustom Burguer', 'restaurante', '12 de Febrero 245, Limache', 4, 'Tuesday: 12PM-11PM', NULL, '9 8486 4884', '47RCXPRP+CJ', '12 de Febrero 245, 2240525 Limache, Valparaiso, Chile'),
('loc-004', 'Compipav', 'restaurante', 'Av. Independencia 25, Limache', 5, NULL, NULL, '(33) 236 7391', NULL, 'Av. Independencia 25, 2240541 Limache, Quillota, Valparaiso, Chile'),
('loc-005', 'Donde La Martina Limache', 'restaurante', 'Av. Independencia 482, Limache', 5, 'Tuesday: 12PM-11PM', NULL, '9 3779 8415', '47RCXPVQ+4J', 'Av. Independencia 482, 2240000 Limache, Valparaiso, Chile');
