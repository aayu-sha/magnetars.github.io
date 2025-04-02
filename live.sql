CREATE TABLE visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    count INT NOT NULL DEFAULT 1
);
INSERT INTO visits (count) VALUES (1); -- Initialize with 1
