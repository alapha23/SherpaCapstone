CREATE USER IF NOT EXISTS 'zgao'@'localhost' IDENTIFIED BY 'admin';
GRANT ALL PRIVILEGES ON *.* TO 'zgao'@'localhost' WITH GRANT OPTION;

CREATE DATABASE IF NOT EXISTS CEL;
USE CEL;

CREATE TABLE IF NOT EXISTS Article (
    article_id INT PRIMARY KEY,
    article_title VARCHAR(2048)
);
CREATE TABLE IF NOT EXISTS Chunk (
    chunk_id INT PRIMARY KEY,
    article_id INT,
    chunk_text TEXT,
    chunk_embeddings BLOB,
    FOREIGN KEY (article_id) REFERENCES Article(article_id)
);
